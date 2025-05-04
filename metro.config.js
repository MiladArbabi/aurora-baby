//metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  // still block server-only code if you want:
  resolver.blockList = exclusionList([
    /\/server\/.*/,                      // still ignore your server folder
    /node_modules\/node-llama-cpp\/.*/,  // (optional) also prevent traversal in that folder
  ]);

  // stub out `fs`, `path`, and `node-llama-cpp` for the React Native bundle
  resolver.extraNodeModules = {
    fs: path.resolve(__dirname, 'emptyModule.js'),
    path: path.resolve(__dirname, 'emptyModule.js'),
    'node-llama-cpp': path.resolve(__dirname, 'emptyModule.js'),
  };

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
})();
