var webpack = require("webpack");
var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var utilEntry = require("./page-entry.config.js");
var entryConfig = require("../entry.config.js");

var commonPlugins = [
	new webpack.optimize.CommonsChunkPlugin({
        name:"vendor",
        minChunks: function (module) {
            if(module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
              return false;
            }
            return module.context && module.context.indexOf("node_modules") !== -1;
        }
    }),
    new ExtractTextPlugin('style.css'),
	new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery',
        'app':path.resolve(__dirname,'../../src/lib/application.js'),
        'VueI18n':path.resolve(__dirname,'../../src/lib/vue-i18n.js'),
        'Vue':path.resolve(__dirname,'../../src/lib/vue.js'),
        'commonMsg':path.resolve(__dirname,'../../src/lib/message-i18n.js'),
        'btExtend':path.resolve(__dirname,'../../src/lib/buttons.emps-extend.js')
    }),
    new CopyWebpackPlugin([
    	{
    		from: path.resolve(__dirname,'../../src/lib/rating/img'),
    		to: path.resolve(__dirname,'../../static/img'),
    		flatten: true
    	},
    	{
    		from: path.resolve(__dirname,'../../src/img'),
    		to: path.resolve(__dirname,'../../static/img'),
    		flatten: true
    	},
        {
            from: path.resolve(__dirname,'../../src/messages'),
            to: path.resolve(__dirname,'../../static/messages'),
            flatten: true
        }
    ])
]


var pages = Object.keys(utilEntry.getEntry('./src/pages/**/*.html', './src/pages/'));
pages.forEach(function(pathname) {
    var conf = {
        filename: '../pages/' + pathname + '.html',
        template: 'src/pages/' + pathname + '.html',
        inject: true,
        chunks:['vendor'],
        minify: {
            removeComments: true,
            collapseWhitespace: true
        }
    };
    if (pathname in entryConfig) {
        conf.chunks.push(pathname);
    }
    commonPlugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = commonPlugins;