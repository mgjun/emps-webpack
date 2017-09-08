var config = {

	entry:require("./webpack-config/entry.config.js"),

	output:require("./webpack-config/output.config.js"),

    externals:[
        require('webpack-require-http')
    ],

	module: require("./webpack-config/module.config.js"),

	resolve: require("./webpack-config/resolve.config.js"),

	plugins: require("./webpack-config/plugins.dev.config.js"),

	devServer:{
	    historyApiFallback:true,
	    hot:true,
	    inline:true,
	    port:9091
	}
};
module.exports = config;