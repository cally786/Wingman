const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Configuración adicional para resolver módulos
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'app': __dirname + '/app',
  'assets': __dirname + '/assets',
};

module.exports = config; 