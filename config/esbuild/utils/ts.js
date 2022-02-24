"use strict";
exports.__esModule = true;
exports.getTarget = void 0;
var fs = require("fs");
var path = require("path");
var tsconfigPath = path.resolve(process.cwd(), './tsconfig.json');
console.log("tsconfigPath: " + tsconfigPath);
function getTarget() {
    var tsconfig = fs.readFileSync(tsconfigPath, 'utf-8');
    var lines = tsconfig.split('\n');
    var target = '2020';
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.includes('target')) {
            var new_target = line.split(': "')[1].split(',')[0].replace('"', '');
            target = new_target.toLowerCase();
        }
    }
    // console.log('target', target);
    return target;
}
exports.getTarget = getTarget;
