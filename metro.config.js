// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
// const { withUniwindConfig } = require("uniwind/metro");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// module.exports = config;

// module.exports = withUniwindConfig(config, {
//   // relative path to your global.css file (from previous step)
//   cssEntryFile: "./global.css",
//   // (optional) path where we gonna auto-generate typings
//   // defaults to project's root
//   dtsFile: "./app/uniwind-types.d.ts",
// });

module.exports = withNativeWind(config, { input: "./global.css" });
