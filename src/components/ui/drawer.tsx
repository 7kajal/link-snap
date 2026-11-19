import { ChevronLeft, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppAppearance } from "@/contexts/appearance-context";

const ANIMATION_MS = 220;
const SLIDE_DISTANCE = 56;

type BottomDrawerProps = {
  children: ReactNode;
  /** Optional destructive/footer action pinned below the scrollable body. */
  footer?: ReactNode;
  /** Called when the user presses back. Renders a back arrow in the header. */
  onBack?: () => void;
  onClose: () => void;
  open: boolean;
  /** Prevents backdrop/close-button dismissal while a task is running. */
  dismissible?: boolean;
  showCloseButton?: boolean;
  /** Small line under the title, e.g. "You are on 1.0.0". */
  description?: string;
  title?: string;
  /**
   * Minimum panel height in points. Keeps short content from producing a squat
   * sheet; the body stretches so the panel always fills this height.
   */
  minHeight?: number;
};

/**
 * Lightweight bottom drawer used by Settings and the in-app update notices.
 *
 * It intentionally mirrors the drawer behaviour in `../mobile-agent`: handle,
 * title, close button, scrollable body and an optional pinned footer. The panel
 * slides up over a dimmed backdrop and is safe-area aware.
 */
export function BottomDrawer({
  children,
  description,
  dismissible = true,
  footer,
  minHeight,
  onBack,
  onClose,
  open,
  showCloseButton = true,
  title,
}: BottomDrawerProps) {
  const { isDarkMode } = useAppAppearance();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(open);
  const [translateY] = useState(() => new Animated.Value(SLIDE_DISTANCE));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const closingRef = useRef(false);

  const animateClosed = useCallback(
    (notify: boolean) => {
      if (closingRef.current) return;
      closingRef.current = true;
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          duration: ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          duration: ANIMATION_MS,
          easing: Easing.in(Easing.cubic),
          toValue: SLIDE_DISTANCE,
          useNativeDriver: true,
        }),
      ]).start(() => {
        closingRef.current = false;
        setVisible(false);
        if (notify) onClose();
      });
    },
    [backdropOpacity, onClose, translateY],
  );

  useEffect(() => {
    if (!open) {
      if (visible) animateClosed(false);
      return;
    }

    if (visible) return;

    // Mount on the next frame so the open transition never starts from a
    // half-rendered Modal (and so this effect does not cascade a render).
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [animateClosed, open, visible]);

  useEffect(() => {
    if (!visible) return;

    translateY.setValue(SLIDE_DISTANCE);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        duration: ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY, visible]);

  const requestClose = useCallback(() => {
    if (!dismissible) return;
    animateClosed(true);
  }, [animateClosed, dismissible]);

  if (!visible) return null;

  return (
    <Modal
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="box-none"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            bottom: 0,
            left: 0,
            opacity: backdropOpacity,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        >
          <Pressable
            accessibilityLabel="Close"
            className="flex-1"
            onPress={requestClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            // NativeWind's className is dropped by RN's animated components,
            // so the panel surface is styled inline.
            backgroundColor: isDarkMode ? "#141414" : "#ffffff",
            borderTopColor: isDarkMode ? "#27272a" : "#e4e4e7",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            maxHeight: "88%",
            ...(minHeight ? { minHeight } : null),
          }}
        >
          <View className="items-center pt-3 pb-1">
            <View
              className={`h-1.5 w-10 rounded-full ${
                isDarkMode ? "bg-zinc-700" : "bg-zinc-300"
              }`}
            />
          </View>

          {title || onBack || showCloseButton ? (
            <View className="flex-row items-start px-5 pt-2 pb-1">
              {onBack ? (
                <Pressable
                  accessibilityLabel="Back"
                  className={`w-9 h-9 items-center justify-center rounded-full mr-2 ${
                    isDarkMode
                      ? "bg-zinc-900 active:bg-zinc-800"
                      : "bg-zinc-100 active:bg-zinc-200"
                  }`}
                  hitSlop={8}
                  onPress={onBack}
                >
                  <ChevronLeft
                    size={18}
                    color={isDarkMode ? "#e4e4e7" : "#3f3f46"}
                    strokeWidth={2.2}
                  />
                </Pressable>
              ) : null}

              <View className="flex-1 min-w-0">
                {title ? (
                  <Text
                    className={`text-xl font-black tracking-tight ${
                      isDarkMode ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {title}
                  </Text>
                ) : null}
                {description ? (
                  <Text
                    className={`text-sm mt-1 leading-relaxed ${
                      isDarkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {description}
                  </Text>
                ) : null}
              </View>

              {showCloseButton ? (
                <Pressable
                  accessibilityLabel="Close settings"
                  className={`w-9 h-9 items-center justify-center rounded-full ml-2 ${
                    isDarkMode
                      ? "bg-zinc-900 active:bg-zinc-800"
                      : "bg-zinc-100 active:bg-zinc-200"
                  }`}
                  disabled={!dismissible}
                  hitSlop={8}
                  onPress={requestClose}
                >
                  <X
                    size={18}
                    color={isDarkMode ? "#e4e4e7" : "#3f3f46"}
                    strokeWidth={2.2}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <ScrollView
            bounces={false}
            contentContainerStyle={{
              paddingBottom: footer ? 16 : Math.max(insets.bottom, 24),
              paddingHorizontal: 20,
              paddingTop: 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? (
            <View
              className={`px-5 pt-3 border-t ${
                isDarkMode ? "border-zinc-800" : "border-zinc-200"
              }`}
              style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
