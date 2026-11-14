import { useMemo } from "react";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import * as WebBrowser from "expo-web-browser";

import { useAppAppearance } from "@/contexts/appearance-context";

const MARKDOWN_PARSER = MarkdownIt({
  breaks: true,
  linkify: true,
  typographer: true,
});

/**
 * Small themed markdown renderer for release notes. Links open in the in-app
 * browser so the update drawer never loses the user's place.
 */
export function MarkdownView({ children }: { children: string }) {
  const { isDarkMode } = useAppAppearance();
  const styles = useMemo(
    () => createMarkdownStyles(isDarkMode),
    [isDarkMode],
  );

  if (!children.trim()) return null;

  return (
    <Markdown
      markdownit={MARKDOWN_PARSER}
      onLinkPress={(url) => {
        void WebBrowser.openBrowserAsync(url);
        return false;
      }}
      style={styles}
    >
      {children}
    </Markdown>
  );
}

function createMarkdownStyles(isDarkMode: boolean) {
  const text = isDarkMode ? "#f4f4f5" : "#18181b";
  const muted = isDarkMode ? "#a1a1aa" : "#52525b";
  const border = isDarkMode ? "#27272a" : "#e4e4e7";
  const codeBackground = isDarkMode ? "#1f1f23" : "#f4f4f5";

  return {
    body: {
      color: text,
      fontSize: 14,
      lineHeight: 22,
    },
    blockquote: {
      backgroundColor: codeBackground,
      borderColor: border,
      borderLeftWidth: 3,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    bullet_list: {
      marginBottom: 8,
      marginTop: 2,
    },
    bullet_list_content: {
      flex: 1,
    },
    bullet_list_icon: {
      color: text,
      marginRight: 8,
      width: 12,
    },
    code_block: {
      backgroundColor: codeBackground,
      borderRadius: 12,
      color: text,
      fontFamily: "monospace",
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 10,
      marginTop: 4,
      padding: 10,
    },
    code_inline: {
      backgroundColor: codeBackground,
      borderRadius: 6,
      color: text,
      fontFamily: "monospace",
      fontSize: 13,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    fence: {
      backgroundColor: codeBackground,
      borderRadius: 12,
      color: text,
      fontFamily: "monospace",
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 10,
      marginTop: 4,
      padding: 10,
    },
    heading1: {
      color: text,
      fontSize: 20,
      fontWeight: "800" as const,
      lineHeight: 26,
      marginBottom: 6,
      marginTop: 12,
    },
    heading2: {
      color: text,
      fontSize: 17,
      fontWeight: "800" as const,
      lineHeight: 23,
      marginBottom: 4,
      marginTop: 12,
    },
    heading3: {
      color: text,
      fontSize: 15,
      fontWeight: "700" as const,
      lineHeight: 21,
      marginBottom: 4,
      marginTop: 10,
    },
    heading4: {
      color: text,
      fontSize: 14,
      fontWeight: "700" as const,
      marginBottom: 4,
      marginTop: 8,
    },
    heading5: {
      color: text,
      fontSize: 14,
      fontWeight: "700" as const,
      marginBottom: 4,
      marginTop: 8,
    },
    heading6: {
      color: muted,
      fontSize: 13,
      fontWeight: "700" as const,
      marginBottom: 4,
      marginTop: 8,
    },
    hr: {
      backgroundColor: border,
      height: 1,
      marginVertical: 12,
    },
    link: {
      color: "#10b981",
      textDecorationLine: "underline" as const,
    },
    list_item: {
      marginBottom: 4,
    },
    ordered_list: {
      marginBottom: 8,
      marginTop: 2,
    },
    ordered_list_icon: {
      color: text,
      marginRight: 8,
      width: 20,
    },
    paragraph: {
      color: text,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 8,
      marginTop: 0,
    },
    strong: {
      fontWeight: "700" as const,
    },
    table: {
      borderColor: border,
      borderWidth: 1,
      marginVertical: 8,
    },
  };
}
