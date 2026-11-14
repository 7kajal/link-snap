import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export async function captureCardAsImage(
  ref: RefObject<View | null>,
): Promise<string | null> {
  if (!ref.current) return null;
  try {
    return await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  } catch (err) {
    console.warn('Capture failed', err);
    return null;
  }
}

/**
 * Open the system share sheet for an already-captured card. Used as a
 * fallback when a direct app target (Instagram / WhatsApp) is unavailable.
 */
export async function shareCapturedImage(uri: string): Promise<boolean> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share link snap',
      UTI: 'public.png',
    });
    return true;
  }
  return false;
}

export async function shareCard(ref: RefObject<View | null>): Promise<boolean> {
  const uri = await captureCardAsImage(ref);
  if (!uri) return false;

  if (Platform.OS === 'web') {
    const filename = 'link-snap.png';
    const file = new File([await (await fetch(uri)).blob()], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Link Snap' });
      return true;
    }
    return false;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share link snap',
      UTI: 'public.png',
    });
    return true;
  }

  await Share.share({ message: 'Link snap' });
  return true;
}

export async function saveCardImage(ref: RefObject<View | null>): Promise<boolean> {
  const uri = await captureCardAsImage(ref);
  if (!uri) return false;

  if (Platform.OS === 'web') {
    const filename = 'link-snap.png';
    const blob = await (await fetch(uri)).blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    return true;
  }

  // expo-media-library imports its native module at module scope; loading it
  // on web crashes static rendering, so pull it in only for native saves.
  const { Asset, requestPermissionsAsync } = await import('expo-media-library');
  const { status } = await requestPermissionsAsync(true, ['photo']);
  if (status !== 'granted') return false;
  await Asset.create(uri);
  return true;
}

export async function shareText(url: string, text?: string): Promise<void> {
  if (Platform.OS === 'web') {
    await navigator.share?.({ url, text: text ?? url });
    return;
  }
  await Share.share({ message: text ?? url, url });
}
