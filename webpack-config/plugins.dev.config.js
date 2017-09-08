var webpack = require("webpack");
var commonPlugins = require("./inherit/plugins.config.js");


commonPlugins.push(new webpack.HotModuleReplacementPlugin());

module.exports = commonPlugins;