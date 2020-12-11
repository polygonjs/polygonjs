"use strict";
exports.__esModule = true;
var esbuild_1 = require("esbuild");
var fs = require("fs");
var path = require("path");
var allowed_extensions = ['js', 'ts'];
function has_allowed_extension(file_path) {
    var elements = file_path.split('.');
    elements.shift();
    var ext = elements.join('.');
    return allowed_extensions.includes(ext);
}
function walk(dir) {
    var files_list = [];
    var list = fs.readdirSync(dir);
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        var file_path = path.resolve(dir, item);
        var stat = fs.statSync(file_path);
        if (stat && stat.isDirectory()) {
            var sub_list = walk(file_path);
            for (var _a = 0, sub_list_1 = sub_list; _a < sub_list_1.length; _a++) {
                var sub_item = sub_list_1[_a];
                files_list.push(sub_item);
            }
        }
        else {
            files_list.push(file_path);
        }
    }
    var accepted_file_list = files_list.filter(function (file_path) { return has_allowed_extension(file_path); });
    return accepted_file_list;
}
var files_list = walk(path.resolve(__dirname, '../../src'));
console.log("esbuild: transpiling " + files_list.length + " files");
// // const out = './dist/out.js';
var outdir = './dist/src';
var POLYGONJS_VERSION = JSON.stringify(require('../../package.json').version);
var options = {
    // entryPoints: ['./src/engine/index.ts'],
    entryPoints: files_list,
    target: 'esnext',
    outdir: outdir,
    // minify: true,
    // minifyWhitespace: false,
    // minifyIdentifiers: false,
    // minifySyntax: false,
    // bundle: true,
    // external: ['require', 'fs', 'path'],
    define: { __POLYGONJS_VERSION__: POLYGONJS_VERSION },
    loader: {
        '.glsl': 'text'
    }
};
esbuild_1.build(options)["catch"](function () { return process.exit(1); });
