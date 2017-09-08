var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	loaders:[
		{test:/\.js$/, loader: 'babel-loader'},
        {test: /\.css$/, loader: ExtractTextPlugin.extract({
                                    fallback: "style-loader",
                                    use: "css-loader"
                                })
        },
		{test: /\.html$/,loader: 'html-loader?attrs=img:src img:data-src'},
		{test: /\.(png|svg|jpg|gif)$/, loader: 'url-loader?limit=50000&name=../img/[name].[hash:8].[ext]'},
		{test: /\.(woff|woff2|eot|ttf|otf|svg)$/, loader: 'url-loader?limit=50000&name=../fonts/[name].[hash:8].[ext]'},
		{test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'}
	]
}