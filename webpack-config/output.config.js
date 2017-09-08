var path = require("path");

var output = {
	filename:"[name].bundle.js",
	path: path.resolve(__dirname,"../static/js")
}

module.exports = output;