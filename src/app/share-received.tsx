import { useIncomingShare } from "expo-sharing";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useAppAppearance } from "@/contexts/appearance-context";
import { extractSharedUrl } from "@/lib/share-to-app";

export default function ShareReceivedScreen() {
  const router = useRouter();
  const { isDarkMode } = useAppAppearance();
  const { sharedPayloads, clearSharedPayloads } = useIncomingShare();

  useEffect(() => {
    const url = extractSharedUrl(sharedPayloads);
    clearSharedPayloads();
    if (url) {
      router.replace({ pathname: "/result", params: { url } });
    } else {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedPayloads]);

  return (
    <View
      className={`flex-1 items-center justify-center ${
        isDarkMode ? "bg-[#09090b]" : "bg-zinc-50"
      }`}
    >
      <ActivityIndicator
        size="large"
        color={isDarkMode ? "#10b981" : "#059669"}
      />
      <Text
        className={`mt-4 text-sm font-semibold ${
          isDarkMode ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        Preparing your story card...
      </Text>
    </View>
  );
}