const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs'); // <-- Needed for some Firebase internal files
defaultConfig.resolver.unstable_enablePackageExports = false; // <-- The key fix

module.exports = defaultConfig;
