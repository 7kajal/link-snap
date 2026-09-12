import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
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
