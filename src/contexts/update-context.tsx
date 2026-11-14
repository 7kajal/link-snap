import Constants from "expo-constants";
import * as Updates from "expo-updates";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, Linking } from "react-native";

import { getSetting, setSetting } from "@/lib/settings";
import {
  checkForGitHubReleaseUpdate,
  fetchReleaseNotes,
  getCurrentVersion,
  installAvailableRelease,
  type AvailableRelease,
  type ReleaseNotes,
} from "@/lib/updates";

/** `app_settings` key holding the release tag the user chose to skip. */
const SKIPPED_RELEASE_TAG_KEY = "app.skippedReleaseTag";
/** Key holding the last OTA update the user pressed Close on. */
const OTA_ACKNOWLEDGED_UPDATE_KEY = "app.otaAcknowledgedUpdateId";

export type OtaUiPhase = "hidden" | "applied";

export type OtaUpdateState = {
  notes: ReleaseNotes | null;
  phase: OtaUiPhase;
  /** Persists the running update id so the drawer never returns for it. */
  acknowledge: () => void;
};

type UpdateContextType = {
  release: AvailableRelease | null;
  checking: boolean;
  installing: boolean;
  /** 0..1 while the APK transfers, `null` before the first progress event. */
  downloadProgress: number | null;
  currentVersion: string;
  ota: OtaUpdateState;
  bannerDismissed: boolean;
  /** True when the last GitHub check failed (offline, rate limit, ...). */
  checkFailed: boolean;
  checkForUpdates: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  /**
   * Hides this release for good: the choice is persisted, so neither the
   * "what's new" drawer nor the banner comes back for the same tag — even
   * after the app restarts.
   */
  skipUpdate: () => Promise<void>;
};

const UpdateContext = createContext<UpdateContextType | null>(null);

export function UpdateProvider({ children }: { children: ReactNode }) {
  const currentVersion = getCurrentVersion();

  const [release, setRelease] = useState<AvailableRelease | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const skippedTagRef = useRef<string | null>(
    getSetting<string | null>(SKIPPED_RELEASE_TAG_KEY, null),
  );
  const dismissedTagRef = useRef<string | null>(null);

  // Native OTA state machine: no extra network calls, expo-updates already
  // checks and downloads at launch and emits these updates as it goes.
  const updatesState = Updates.useUpdates();
  const runningUpdateId = updatesState.currentlyRunning.isEmbeddedLaunch
    ? null
    : (updatesState.currentlyRunning.updateId ?? null);

  const [otaAcknowledgedId, setOtaAcknowledgedId] = useState<string | null>(
    () => getSetting<string | null>(OTA_ACKNOWLEDGED_UPDATE_KEY, null),
  );
  const [otaNotes, setOtaNotes] = useState<ReleaseNotes | null>(null);

  const otaPhase: OtaUiPhase =
    runningUpdateId &&
    runningUpdateId !== otaAcknowledgedId &&
    Updates.isEnabled
      ? "applied"
      : "hidden";

  const checkForUpdates = useCallback(async () => {
    try {
      setChecking(true);
      setCheckFailed(false);
      const nextRelease = await checkForGitHubReleaseUpdate();

      if (
        nextRelease &&
        (nextRelease.tagName === dismissedTagRef.current ||
          nextRelease.tagName === skippedTagRef.current)
      ) {
        return;
      }

      setRelease(nextRelease);
    } catch (error) {
      // Do not claim "up to date" when the check itself failed.
      console.warn(error);
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!release) return;

    try {
      setInstalling(true);
      setDownloadProgress(null);
      await installAvailableRelease(release, (progress) => {
        setDownloadProgress(progress);
      });
    } catch (error) {
      console.error(error);
      await Linking.openURL(release.url);
    } finally {
      setInstalling(false);
      setDownloadProgress(null);
    }
  }, [release]);

  const dismissUpdate = useCallback(() => {
    if (!release) return;

    dismissedTagRef.current = release.tagName;
    setBannerDismissed(true);
  }, [release]);

  const skipUpdate = useCallback(async () => {
    const tagName = release?.tagName ?? skippedTagRef.current;

    if (!tagName) return;

    skippedTagRef.current = tagName;
    dismissedTagRef.current = tagName;
    setBannerDismissed(true);
    setSetting(SKIPPED_RELEASE_TAG_KEY, tagName);
  }, [release]);

  const acknowledgeOtaUpdate = useCallback(() => {
    if (!runningUpdateId) return;

    setOtaAcknowledgedId(runningUpdateId);
    setSetting(OTA_ACKNOWLEDGED_UPDATE_KEY, runningUpdateId);
  }, [runningUpdateId]);

  useEffect(() => {
    // The running bundle has no notes of its own (eas update messages never
    // reach the client manifest), so fall back to the GitHub release published
    // for this app version — the changelog the OTA ships on top of.
    if (otaPhase !== "applied" || otaNotes) return;

    let cancelled = false;
    fetchReleaseNotes(Constants.expoConfig?.version ?? "0.0.0")
      .then((notes) => {
        if (!cancelled) setOtaNotes(notes);
      })
      .catch((error) => {
        console.warn(error);
      });

    return () => {
      cancelled = true;
    };
  }, [otaNotes, otaPhase]);

  useEffect(() => {
    // The launch check is network I/O — keep it off the startup critical path.
    // First check runs when the JS thread is idle plus a grace delay; returning
    // to the app checks immediately via the listener below.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      timer = setTimeout(() => {
        void checkForUpdates();
      }, 3000);
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(schedule);
    } else {
      schedule();
    }

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void checkForUpdates();
      }
    });

    return () => {
      subscription.remove();
      if (timer) clearTimeout(timer);
    };
  }, [checkForUpdates]);

  return (
    <UpdateContext.Provider
      value={{
        bannerDismissed,
        checkFailed,
        checking,
        currentVersion,
        downloadProgress,
        installUpdate,
        installing,
        ota: {
          acknowledge: acknowledgeOtaUpdate,
          notes: otaNotes,
          phase: otaPhase,
        },
        release,
        checkForUpdates,
        dismissUpdate,
        skipUpdate,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
  const context = useContext(UpdateContext);

  if (!context) {
    throw new Error("useUpdate must be used inside UpdateProvider");
  }

  return context;
}
