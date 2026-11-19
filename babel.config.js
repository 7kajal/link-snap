const path = require("path");

// `babel-preset-expo` ships as a dependency of `expo`, not of this project.
// With pnpm's strict node_modules there is no hoisted root copy, so resolving
// it by bare name fails during `expo export` ("Cannot find module
// 'babel-preset-expo'", which surfaces as "Cannot read properties of undefined
// (reading 'transformFile')"). Fall back to resolving it from expo itself.
function resolvePreset(name) {
  try {
    return require.resolve(name);
  } catch {
    const expoDir = path.dirname(require.resolve("expo/package.json"));
    return require.resolve(name, { paths: [expoDir] });
  }
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [resolvePreset("babel-preset-expo"), { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
