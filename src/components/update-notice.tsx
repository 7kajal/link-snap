import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppAppearance } from "@/contexts/appearance-context";
import { useUpdate } from "@/contexts/update-context";

import { BottomDrawer } from "./ui/drawer";
import { MarkdownView } from "./ui/markdown-view";
import { UpdatePanel } from "./ui/update-panel";

/**
 * Launch-time update notice, mirroring `../mobile-agent`:
 * - a newer APK release opens the "What's new" drawer once per release;
 * - an OTA bundle that is already running opens an informational drawer once.
 *
 * Dismissing the APK drawer hides it for this session. "Skip this version"
 * persists the tag so it never returns.
 */
export function UpdateNotice() {
  const { bannerDismissed, dismissUpdate, ota, release } = useUpdate();
  const [otaDismissed, setOtaDismissed] = useState(false);

  if (release && !bannerDismissed) {
    const close = () => dismissUpdate();

    return (
      <BottomDrawer
        onClose={close}
        open
        title={`What's new in ${release.name}`}
      >
        <UpdatePanel onDone={close} />
      </BottomDrawer>
    );
  }

  if (ota.phase === "applied" && !otaDismissed) {
    const close = () => {
      ota.acknowledge();
      setOtaDismissed(true);
    };
    const notesBody = ota.notes?.body.trim() ?? "";

    return (
      <BottomDrawer
        description="Here's what's new in this update."
        onClose={close}
        open
        title="App has been updated"
      >
        <View>
          {notesBody ? (
            <MarkdownView>{ota.notes?.body ?? ""}</MarkdownView>
          ) : (
            <Text className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {ota.notes
                ? "The full changelog is on the release page."
                : "Your app is up to date with the latest changes."}
            </Text>
          )}

          <CloseButton onPress={close} />
        </View>
      </BottomDrawer>
    );
  }

  return null;
}

function CloseButton({ onPress }: { onPress: () => void }) {
  const { isDarkMode } = useAppAppearance();

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-12 items-center justify-center rounded-2xl mt-6 ${
        isDarkMode ? "bg-white active:bg-zinc-200" : "bg-zinc-900 active:bg-zinc-800"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-bold ${
          isDarkMode ? "text-zinc-900" : "text-white"
        }`}
      >
        Close
      </Text>
    </Pressable>
  );
}
