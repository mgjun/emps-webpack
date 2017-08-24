var webpack = require("webpack");
var path = require("path");
var pathMap = require("./src/pathMap.json");

module.exports = {
	entry:{
		viewTransporterComplete: "./src/js/viewTransporterComplete.js",
		vendor: ['jquery','bs-js','bs-css','app-css',"icheck-js","icheck-css",
				'alertify-js','alertify-css']
	},
	output:{
		filename:"[name].bundle.js",
		path: path.resolve(__dirname,"./static/js")
	},
	module: {
		loaders:[
			{test: /\.css$/, loader: 'style-loader!css-loader'},
			{test: /\.(png|svg|jpg|gif)$/, loader: 'url-loader?limit=50000&name=img/[name].[hash:8].[ext]'},
			{test: /\.(woff|woff2|eot|ttf|otf)$/, loader: 'file-loader'},
			{test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'}
		]
	},
	resolve: {
        alias: pathMap
    },
	plugins:[
		new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest'],
            minChunks: Infinity
        }),
		// new webpack.ProvidePlugin({
  //           $: 'jquery',
  //           jQuery: 'jquery',
  //           'window.jQuery': 'jquery',
  //           'window.$': 'jquery'
  //       })
	]
}