"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var common_1 = require("./common");
var filePath = path.join(common_1.polygonjsRoot, "public/bundled_types.d.ts");
var REG_SINGLE_QUOTES = /import\(\'three\'\)\./g;
var REG_DOUBLE_QUOTES = /import\(\"three\"\)\./g;
function removeThreeImports() {
    var content = fs.readFileSync(filePath, 'utf-8');
    //- remove occurences of import("three").
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        line = line.replace(REG_SINGLE_QUOTES, '').replace(REG_DOUBLE_QUOTES, '');
        newLines.push(line);
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
function replaceMTLLoaderDeclaration() {
    var content = fs.readFileSync(filePath, 'utf-8');
    //- remove occurences of import("three").
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        if (line.includes('class MTLLoader extends')) {
            line = line.replace('class MTLLoader extends', 'class MTLLoader_not_needed extends');
        }
        newLines.push(line);
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
removeThreeImports();
replaceMTLLoaderDeclaration();
