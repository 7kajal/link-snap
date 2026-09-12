import { useEffect } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type SkeletonCardProps = ViewProps & {
  isDark?: boolean;
};

/**
 * Dummy story-card shown while the link preview is being fetched. Mimics the
 * real scene shape (9:16 canvas + floating card with media block and text
 * lines) with a soft opacity pulse. Never part of the captured image.
 */
export function SkeletonCard({ isDark, style, ...rest }: SkeletonCardProps) {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const track = isDark ? "#1C1C1E" : "#E9E9EE";
  const shine = isDark ? "#2A2A2E" : "#F4F4F7";

  return (
    <View style={[styles.canvas, { backgroundColor: track }, style]} {...rest}>
      <View style={styles.center}>
        <Animated.View style={[styles.card, { backgroundColor: shine }, glow]}>
          <View style={[styles.media, { backgroundColor: track }]} />
          <View style={[styles.line, styles.lineTitle, { backgroundColor: track }]} />
          <View style={[styles.line, { backgroundColor: track }]} />
          <View style={[styles.line, styles.lineShort, { backgroundColor: track }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 28,
    overflow: "hidden",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "88%",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  line: {
    width: "100%",
    height: 12,
    borderRadius: 6,
  },
  lineTitle: {
    width: "82%",
    height: 16,
    borderRadius: 8,
  },
  lineShort: {
    width: "55%",
  },
});

export default SkeletonCard;
