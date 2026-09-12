import { Image, StyleSheet, View } from "react-native";
import { useImageSize } from "@/lib/use-image-size";

type InstantHeroProps = {
  uri: string;
  width: number;
  height: number;
  radius: number;
  accent: string;
};

const BACKDROP_SCALE = 2.0;
const BACKDROP_BLUR = 10;
const BACKDROP_DARKEN = "rgba(0,0,0,0.35)";

/**
 * Adaptive image hero. When the image's aspect ratio roughly matches the
 * frame it fills it (cover/crop). When it doesn't (e.g. a 16:9 landscape in a
 * 9:16 story) it renders in "instant" style: a scaled + darkened + blurred
 * version of itself fills the frame while the real image sits centered on top.
 *
 * The backdrop is built from core RN primitives so it survives
 * react-native-view-shot capture on native and the web capture path (no
 * expo-blur, which is unreliable to capture on Android).
 */
export function InstantHero({ uri, width, height, radius, accent }: InstantHeroProps) {
  const { width: iw, height: ih, loaded } = useImageSize(uri);

  const frameRatio = height > 0 ? width / height : 1;
  const imageRatio = iw > 0 && ih > 0 ? iw / ih : frameRatio;
  const useCover = loaded && iw > 0 && ih > 0 && Math.abs(imageRatio - frameRatio) / frameRatio <= 0.35;

  return (
    <View style={[styles.frame, { width, height, borderRadius: radius }]}>
      {useCover ? (
        <Image source={{ uri }} style={styles.fill} resizeMode="cover" />
      ) : (
        <>
          <Image
            source={{ uri }}
            style={[styles.fill, styles.backdrop]}
            resizeMode="cover"
            blurRadius={BACKDROP_BLUR}
          />
          <View style={styles.backdropDarken} />
          <View style={[styles.ring, { borderColor: accent }]}>
            <Image source={{ uri }} style={styles.fill} resizeMode="contain" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    alignSelf: "center",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  backdrop: {
    transform: [{ scale: BACKDROP_SCALE }],
  },
  backdropDarken: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BACKDROP_DARKEN,
  },
  ring: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});