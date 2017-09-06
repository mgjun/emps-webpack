var webpack = require("webpack");
var path = require("path");
var pathMap = require("./src/pathMap.json");
var glob = require("glob");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var extractCSS = new ExtractTextPlugin('css/[name]-one.css');
var extractLESS = new ExtractTextPlugin('css/[name]-two.css');

var entries = getEntry('./src/js/*.js', './src/js/');
var chunks = Object.keys(entries);

var config = {
	entry:Object.assign(entries, {
        vendor: ['font-self','bs-js','bs-css','font-awesome',
                'adminLTE-css','icheck-css','alertify-css','alertify-core-css',
                'toastr-css','loading-overlay-css','datatables.net','dt-bs-css',
                'dt-bs-js','datatables.net-buttons','dt-flash','dt-jszip',
                'dt-pdfmake','dt-vfs-fonts','dt-colVis','dt-html5','dt-print',
                'select2-js','select2-css','datepicker-js','datepicker-css',
                'datetimepicker-js','datetimepicker-css','raty-js',
                'fileinput-css','fileinput-canvas-js','fileinput-sortable-js','fileinput-purify-js',
                'fileinput-js','fileinput-theme-js','fileinput-extent-js','cropper-js','cropper-css',
                'app-css'] 
    }),
	output:{
		filename:"[name].bundle.js",
		path: path.resolve(__dirname,"./static/js")
	},
    externals:[
        require('webpack-require-http')
    ],
	module: {
		loaders:[
			// {test: /\.js$/, loader: 'babel-loader'},
			{test: /\.css$/, loader: 'style-loader!css-loader'},
            // {test: /\.css$/, loader: extractCSS.extract([ 'style-loader','css-loader'])},
			{test: /\.html$/,loader: 'html-loader?attrs=img:src img:data-src'},
			{test: /\.(png|svg|jpg|gif)$/, loader: 'url-loader?limit=50000&name=../img/[name].[hash:8].[ext]'},
			{test: /\.(woff|woff2|eot|ttf|otf|svg)$/, loader: 'url-loader?limit=50000&name=../fonts/[name].[hash:8].[ext]'},
			{test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'}
		]
        // ,
        // rules: [
        //     {
        //         test: /\.css$/,
        //         use: extractCSS.extract([ 'css-loader'])
        //     },
        //     {
        //         test: /\.less$/i,
        //         use: extractLESS.extract([ 'less-loader' ])
        //     },
        // ]
	},
	resolve: {
        alias: pathMap
    },
	plugins:[
        // extractCSS,extractLESS,
        new webpack.optimize.CommonsChunkPlugin({
            name:"vendor",
            minChunks: function (module) {
                if(module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
                  return false;
                }
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        // new ExtractTextPlugin('style.css'),
		new webpack.optimize.CommonsChunkPlugin({
            name:"manifest",
            minChunks: Infinity
        }),
		new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
            'app':path.resolve(__dirname,'./src/lib/application.js'),
            'VueI18n':path.resolve(__dirname,'./src/lib/vue-i18n.js'),
            'Vue':path.resolve(__dirname,'./src/lib/vue.js'),
            'commonMsg':path.resolve(__dirname,'./src/lib/message-i18n.js'),
            'btExtend':path.resolve(__dirname,'./src/lib/buttons.emps-extend.js')
        }),
        new CopyWebpackPlugin([
        	{
        		from: path.resolve(__dirname,'./src/lib/rating/img'),
        		to: path.resolve(__dirname,'./static/img'),
        		flatten: true
        	},
        	{
        		from: path.resolve(__dirname,'./src/img'),
        		to: path.resolve(__dirname,'./static/img'),
        		flatten: true
        	},
            {
                from: path.resolve(__dirname,'./src/messages'),
                to: path.resolve(__dirname,'./static/messages'),
                flatten: true
            }
        ])
        ,
        new UglifyJSPlugin({
            output: {
                comments: false,
                beautify: false
            },
            warnings: false
        })
	],
	devServer:{
	    historyApiFallback:true,
	    hot:true,
	    inline:true,
	    port:9091
	}
};


var pages = Object.keys(getEntry('src/pages/**/*.html', 'src/pages/'));
pages.forEach(function(pathname) {
    var conf = {
        filename: '../pages/' + pathname + '.html',
        template: 'src/pages/' + pathname + '.html',
        inject: true,
        chunks:['vendor', 'manifest']
        // minify: {
        //     removeComments: true,
        //     collapseWhitespace: false
        // }
    };
    if (pathname in config.entry) {
        conf.chunks.push(pathname);
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
});


function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {};

    for (var i = 0; i < files.length; i++) {
        var filePath = files[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        entries[filename] = filePath;
    }
    return entries;
}

module.exports = config;