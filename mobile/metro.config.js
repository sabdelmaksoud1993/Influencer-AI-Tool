const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent Metro from watching parent directory's node_modules
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /\.\.\/node_modules\/.*/,
  /\.\.\/\.next\/.*/,
];

module.exports = config;
