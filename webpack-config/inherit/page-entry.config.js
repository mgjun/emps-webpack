var glob = require("glob");

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


module.exports = {
	getEntry:getEntry
}