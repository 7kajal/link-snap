import { Linking, Platform } from 'react-native';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { getFbAppId } from './config';
import {
  captureCardAsImage,
  saveCardImage,
  shareCapturedImage,
  shareCard,
} from './share';

type RNShareModule = typeof import('react-native-share');

/**
 * react-native-share is native-only and evaluates
 * `TurboModuleRegistry.getEnforcing('RNShare')` at import time. On web,
 * react-native resolves to react-native-web, which has no TurboModuleRegistry,
 * so importing it crashes Expo Router's static render. Load it lazily and only
 * on native platforms.
 */
async function loadRNShare(): Promise<RNShareModule | null> {
  if (Platform.OS === 'web') return null;
  return import('react-native-share');
}

export type ShareTargetId = 'instagram' | 'whatsapp' | 'facebook' | 'save' | 'more';

export type ShareTarget = {
  id: ShareTargetId;
  /** Short label shown under the share button. */
  label: string;
  /** Brand color used for the share button. */
  color: string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'save', label: 'Save Image', color: '#71717A' },
  { id: 'more', label: 'More', color: '#10B981' },
];

const ANDROID_PACKAGES: Record<Exclude<ShareTargetId, 'more' | 'save'>, string[]> = {
  instagram: ['com.instagram.android'],
  whatsapp: ['com.whatsapp', 'com.whatsapp.w4b'],
  facebook: ['com.facebook.katana'],
};

const IOS_SCHEMES: Record<Exclude<ShareTargetId, 'more' | 'save'>, string[]> = {
  instagram: ['instagram://'],
  whatsapp: ['whatsapp://'],
  facebook: ['fb://'],
};

async function isAppInstalled(target: Exclude<ShareTargetId, 'more' | 'save'>): Promise<boolean> {
  try {
    const rnShare = await loadRNShare();
    if (!rnShare) return false;

    if (Platform.OS === 'android') {
      for (const pkg of ANDROID_PACKAGES[target]) {
        const res = await rnShare.default.isPackageInstalled(pkg);
        if (res?.isInstalled) return true;
      }
      return false;
    }
    if (Platform.OS === 'ios') {
      for (const scheme of IOS_SCHEMES[target]) {
        if (await Linking.canOpenURL(scheme)) return true;
      }
      return false;
    }
    return false;
  } catch {
    // Native module missing (e.g. Expo Go) or query failed.
    return false;
  }
}

/**
 * Targets offered before the install check finishes. Instagram and WhatsApp are
 * always shown on native so the story actions never disappear when package
 * visibility / the native share module is unavailable (Expo Go, a stale dev
 * build, Android package-query restrictions). `shareToTarget` falls back to the
 * system share sheet if the target app cannot actually be opened.
 */
export function getDefaultAvailableTargets(): Record<ShareTargetId, boolean> {
  if (Platform.OS === 'web') {
    return { instagram: false, whatsapp: false, facebook: false, save: true, more: true };
  }
  return { instagram: true, whatsapp: true, facebook: false, save: true, more: true };
}

/**
 * Which share targets can be offered right now. Web only supports the system
 * sheet. Instagram and WhatsApp stay visible on native; Facebook Stories still
 * requires a Facebook App ID and the Facebook app.
 */
export async function getAvailableTargets(): Promise<Record<ShareTargetId, boolean>> {
  if (Platform.OS === 'web') {
    return getDefaultAvailableTargets();
  }
  const appId = getFbAppId();
  const facebook = await isAppInstalled('facebook');
  return {
    ...getDefaultAvailableTargets(),
    facebook: facebook && appId.length > 0,
  };
}

export type ShareOutcome = 'shared' | 'cancelled';

export type WhatsAppVariant = 'personal' | 'business';

export async function getAvailableWhatsAppVariants(): Promise<WhatsAppVariant[]> {
  if (Platform.OS !== 'android') return ['personal'];

  const rnShare = await loadRNShare();
  if (!rnShare) return ['personal'];

  const [personal, business] = await Promise.all(
    ANDROID_PACKAGES.whatsapp.map(async (pkg) => {
      try {
        return Boolean((await rnShare.default.isPackageInstalled(pkg))?.isInstalled);
      } catch {
        return false;
      }
    }),
  );

  return [
    ...(personal ? (['personal'] as const) : []),
    ...(business ? (['business'] as const) : []),
  ];
}

function isUserCancel(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return /cancel|dismiss|did not share/i.test(msg);
}

/**
 * Capture the card and share it to a specific target. User cancellation
 * resolves as 'cancelled' (no error UI); real failures throw.
 */
export async function shareToTarget(
  ref: RefObject<View | null>,
  target: ShareTargetId,
  message?: string,
  whatsAppVariant: WhatsAppVariant = 'personal',
): Promise<ShareOutcome> {
  const uri = await captureCardAsImage(ref);
  if (!uri) throw new Error('Could not capture the card image');

  try {
    if (target === 'save') {
      // Save the rendered card to the device photo library (download on web).
      const saved = await saveCardImage(ref);
      return saved ? 'shared' : 'cancelled';
    }
    if (target === 'more') {
      // System share sheet (existing behavior).
      const ok = await shareCard(ref);
      return ok ? 'shared' : 'cancelled';
    }

    const rnShare = await loadRNShare();
    if (!rnShare) {
      throw new Error('Sharing to apps is not supported on this platform');
    }

    if (target === 'instagram') {
      try {
        await rnShare.default.shareSingle({
          social: rnShare.Social.InstagramStories,
          appId: getFbAppId(),
          backgroundImage: uri,
        });
        return 'shared';
      } catch (err) {
        if (isUserCancel(err)) return 'cancelled';
        // Instagram missing or the story intent rejected the payload: keep the
        // action useful by handing the image to the system share sheet.
        const ok = await shareCapturedImage(uri);
        return ok ? 'shared' : 'cancelled';
      }
    }
    if (target === 'facebook') {
      await rnShare.default.shareSingle({
        social: rnShare.Social.FacebookStories,
        appId: getFbAppId(),
        backgroundImage: uri,
      });
      return 'shared';
    }
    if (target === 'whatsapp') {
      // Opens WhatsApp's picker (includes My Status on supported versions).
      try {
        await rnShare.default.shareSingle({
          social:
            whatsAppVariant === 'business'
              ? rnShare.Social.Whatsappbusiness
              : rnShare.Social.Whatsapp,
          url: uri,
          type: 'image/png',
          message,
        });
        return 'shared';
      } catch (err) {
        if (isUserCancel(err)) return 'cancelled';
        const ok = await shareCapturedImage(uri);
        return ok ? 'shared' : 'cancelled';
      }
    }

    // Unreachable: every ShareTargetId is handled above.
    return 'cancelled';
  } catch (err) {
    if (isUserCancel(err)) return 'cancelled';
    throw err;
  }
}
