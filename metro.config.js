// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

// Get default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Exclude Flow type files so Metro doesn't try to parse .js.flow
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'flow');

// Add support for .cjs files (needed by some dependencies)
config.resolver.sourceExts.push('cjs');

// Ensure Package Exports are handled correctly
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
