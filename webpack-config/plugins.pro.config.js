var path = require("path");
var commonPlugins = require("./inherit/plugins.config.js");
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

commonPlugins.push(
    new UglifyJSPlugin({
        output: {
            comments: false,
            beautify: false
        },
        warnings: false,
        parallel:true
    })
);


module.exports = commonPlugins;