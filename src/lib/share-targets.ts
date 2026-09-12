import { Linking, Platform } from 'react-native';
import Share, { Social } from 'react-native-share';
import type { RefObject } from 'react';
import type { View } from 'react-native';

import { getFbAppId } from './config';
import { captureCardAsImage, shareCard } from './share';

export type ShareTargetId = 'instagram' | 'whatsapp' | 'facebook' | 'more';

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
  { id: 'more', label: 'More', color: '#10B981' },
];

const ANDROID_PACKAGES: Record<Exclude<ShareTargetId, 'more'>, string[]> = {
  instagram: ['com.instagram.android'],
  whatsapp: ['com.whatsapp', 'com.whatsapp.w4b'],
  facebook: ['com.facebook.katana'],
};

const IOS_SCHEMES: Record<Exclude<ShareTargetId, 'more'>, string[]> = {
  instagram: ['instagram://'],
  whatsapp: ['whatsapp://'],
  facebook: ['fb://'],
};

async function isAppInstalled(target: Exclude<ShareTargetId, 'more'>): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      for (const pkg of ANDROID_PACKAGES[target]) {
        const res = await Share.isPackageInstalled(pkg);
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
 * Which share targets can be offered right now. Web only supports the system
 * sheet. Android's Instagram story intent works without a Facebook App ID
 * (it is only used for attribution), so Instagram only requires the host app
 * to be installed. Facebook Stories still requires a Facebook App ID.
 */
export async function getAvailableTargets(): Promise<Record<ShareTargetId, boolean>> {
  if (Platform.OS === 'web') {
    return { instagram: false, whatsapp: false, facebook: false, more: true };
  }
  const appId = getFbAppId();
  const [instagram, whatsapp, facebook] = await Promise.all([
    isAppInstalled('instagram'),
    isAppInstalled('whatsapp'),
    isAppInstalled('facebook'),
  ]);
  return {
    instagram,
    whatsapp,
    facebook: facebook && appId.length > 0,
    more: true,
  };
}

export type ShareOutcome = 'shared' | 'cancelled';

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
): Promise<ShareOutcome> {
  const uri = await captureCardAsImage(ref);
  if (!uri) throw new Error('Could not capture the card image');

  try {
    if (target === 'instagram') {
      await Share.shareSingle({
        social: Social.InstagramStories,
        appId: getFbAppId(),
        backgroundImage: uri,
      });
      return 'shared';
    }
    if (target === 'facebook') {
      await Share.shareSingle({
        social: Social.FacebookStories,
        appId: getFbAppId(),
        backgroundImage: uri,
      });
      return 'shared';
    }
    if (target === 'whatsapp') {
      // Opens WhatsApp's picker (includes My Status on supported versions).
      await Share.shareSingle({
        social: Social.Whatsapp,
        url: uri,
        type: 'image/png',
        message,
      });
      return 'shared';
    }
    // 'more' → system share sheet (existing behavior).
    const ok = await shareCard(ref);
    return ok ? 'shared' : 'cancelled';
  } catch (err) {
    if (isUserCancel(err)) return 'cancelled';
    throw err;
  }
}
