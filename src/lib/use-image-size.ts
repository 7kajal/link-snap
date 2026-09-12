import { useEffect, useState } from "react";
import { Image } from "react-native";

export type ImageSize = {
  width: number;
  height: number;
  loaded: boolean;
};

/**
 * Measure an image's intrinsic dimensions. Works on native via Image.getSize
 * (react-native-web supports it too).
 */
export function useImageSize(uri: string | null | undefined): ImageSize {
  const [size, setSize] = useState<ImageSize>({
    width: 0,
    height: 0,
    loaded: false,
  });

  useEffect(() => {
    if (!uri) {
      setSize({ width: 0, height: 0, loaded: false });
      return;
    }
    let cancelled = false;
    Image.getSize(
      uri,
      (width, height) => {
        if (cancelled) return;
        setSize({ width, height, loaded: true });
      },
      () => {
        if (!cancelled) setSize({ width: 0, height: 0, loaded: false });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return size;
}