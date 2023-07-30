"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var common_1 = require("./common");
var filePath = path.join(common_1.polygonjsRoot, "public/bundled_types.d.ts");
// const REG_SINGLE_QUOTES = /import\(\'three\'\)\./g;
// const REG_DOUBLE_QUOTES = /import\(\"three\"\)\./g;
var errors_detected_1 = require("./errors_detected");
var errorRegex = /(\d+),(\d+)/;
function erroredLineNumbers() {
    var lines = errors_detected_1.ERRORS_DETECTED.split('\n');
    var lineNumbers = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var match = line.match(errorRegex);
        if (match) {
            var lineNumber = parseInt(match[1]);
            // const columnNumber = match[2];
            lineNumbers.push(lineNumber);
        }
    }
    return lineNumbers;
}
// function removeThreeImports() {
// 	const content = fs.readFileSync(filePath, 'utf-8');
// 	//- remove occurences of import("three").
// 	const lines = content.split('\n');
// 	const newLines: string[] = [];
// 	for (let line of lines) {
// 		line = line.replace(REG_SINGLE_QUOTES, '').replace(REG_DOUBLE_QUOTES, '');
// 		newLines.push(line);
// 	}
// 	fs.writeFileSync(filePath, newLines.join('\n'));
// }
function removeThreePrefix() {
    var content = fs.readFileSync(filePath, 'utf-8');
    //- remove occurences of import("three").
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        line = line.replace('THREE.', '');
        newLines.push(line);
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
function removeJsepPrefix() {
    var content = fs.readFileSync(filePath, 'utf-8');
    //- remove occurences of import("three").
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
        var line = lines_3[_i];
        line = line.replace('jsep.', '');
        newLines.push(line);
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
// function replaceMTLLoaderDeclaration() {
// 	const content = fs.readFileSync(filePath, 'utf-8');
// 	//- remove occurences of import("three").
// 	const lines = content.split('\n');
// 	const newLines: string[] = [];
// 	for (let line of lines) {
// 		if (line.includes('class MTLLoader extends')) {
// 			line = line.replace('class MTLLoader extends', 'class MTLLoader_not_needed extends');
// 		}
// 		newLines.push(line);
// 	}
// 	fs.writeFileSync(filePath, newLines.join('\n'));
// }
function removeExportPrefix() {
    var WORDS = ['class', 'type', 'interface', 'const', 'declare']; //.map(p=>`declare ${p}`)
    function fixLine(line) {
        for (var _i = 0, WORDS_1 = WORDS; _i < WORDS_1.length; _i++) {
            var word = WORDS_1[_i];
            line = line.replace("export ".concat(word), word);
        }
        // also remove last export
        if (line.includes('export {};')) {
            return '';
        }
        return line;
    }
    var content = fs.readFileSync(filePath, 'utf-8');
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_4 = lines; _i < lines_4.length; _i++) {
        var line = lines_4[_i];
        newLines.push(fixLine(line));
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
function addTSIgnoreBeforeDetectedErrors() {
    var lineNumbers = erroredLineNumbers();
    var linesNumbersSet = new Set(lineNumbers);
    var content = fs.readFileSync(filePath, 'utf-8');
    var lines = content.split('\n');
    var newLines = [];
    var i = 1; // line count starts at 1
    for (var _i = 0, lines_5 = lines; _i < lines_5.length; _i++) {
        var line = lines_5[_i];
        if (linesNumbersSet.has(i)) {
            newLines.push("// @ts-ignore");
            console.log(i, line);
        }
        newLines.push(line);
        i++;
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
addTSIgnoreBeforeDetectedErrors();
removeThreePrefix();
removeJsepPrefix();
removeExportPrefix();
// removeThreeImports();
// replaceMTLLoaderDeclaration();
