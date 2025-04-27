//metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  resolver.blockList = exclusionList([
    /\/server\/.*/,                      // ignore everything under server/
    /\/src\/services\/LlamaService\.ts$/ // ignore exactly this file
  ]);
  
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