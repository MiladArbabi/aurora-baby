const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (async () => {
  // Use getDefaultConfig from expo/metro-config, which is compatible with React Native
  const config = await getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  // Block server-only code
  resolver.blockList = exclusionList([
    /\/server\/.*/,                      // Ignore server folder
    /node_modules\/node-llama-cpp\/.*/,  // (optional) Ignore node-llama-cpp
  ]);

  // Stub out Node.js modules for React Native
  resolver.extraNodeModules = {
    fs: path.resolve(__dirname, 'emptyModule.js'),
    path: path.resolve(__dirname, 'emptyModule.js'),
    'node-llama-cpp': path.resolve(__dirname, 'emptyModule.js'),
    crypto: path.resolve(__dirname, 'emptyModule.js'),
    url: path.resolve(__dirname, 'emptyModule.js'),
    http: path.resolve(__dirname, 'emptyModule.js'),
    https: path.resolve(__dirname, 'emptyModule.js'),
  };

  // Force Metro to resolve axios to the browser-compatible build
  resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'axios') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/axios/lib/axios.js'),
        type: 'sourceFile',
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  };

  // SVG transformer configuration
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