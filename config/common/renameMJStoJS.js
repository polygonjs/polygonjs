"use strict";
exports.__esModule = true;
var path = require("path");
var fs = require("fs");
var walk_1 = require("./walk");
function MJSfilePaths(srcPath) {
    return (0, walk_1.walk)(srcPath, function () { return true; });
}
var srcPath = path.join(__dirname, '../../dist');
var filePaths = MJSfilePaths(srcPath);
var renamedFilesCount = 0;
for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
    var filePath = filePaths_1[_i];
    var basename = path.basename(filePath);
    var elements = basename.split('.');
    var firstExt = elements[1];
    if (firstExt == 'mjs') {
        var destFilePath = filePath.replace('.mjs.', '.js.').replace('.mjs', '.js');
        fs.renameSync(filePath, destFilePath);
        renamedFilesCount++;
    }
}
console.log("renamed " + renamedFilesCount + " files from .mjs to .js (since they are created as .mjs by webpack 5)");
