const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// pnpm installs two copies of react-native-css-interop: the one nativewind
// depends on (inside .pnpm) and a leftover copy at the project root. Metro's
// resolver can pick the wrong one for imports that start from the symlinked
// `node_modules/nativewind` path, which means the compiled CSS gets injected
// into one copy while the runtime components read the other. Each copy has its
// own style Symbols, so every className resolves to unresolved rule objects and
// the UI renders blank. Pin all react-native-css-interop imports to the copy
// nativewind uses (the one NativeWind generates .cache/<platform>.js into).
const nativewindDir = path.dirname(require.resolve("nativewind/package.json"));

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isCssInterop =
    moduleName === "react-native-css-interop" ||
    moduleName.startsWith("react-native-css-interop/");

  if (isCssInterop) {
    context = {
      ...context,
      // Resolve as if the import came from nativewind itself, which makes the
      // resolver land on nativewind's own react-native-css-interop dependency.
      originModulePath: path.join(nativewindDir, "package.json"),
    };
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./src/global.css",
  // Expo's Metro dev server does not run NativeWind's virtual-module hook, so
  // the generated style cache stays an empty placeholder unless it is written
  // to disk instead.
  forceWriteFileSystem: true,
});
