"use strict";
exports.__esModule = true;
exports.getOptions = exports.POLYGONJS_VERSION = exports.outdir = exports.esbuild_entries = exports.srcPath = void 0;
var FileUtils_1 = require("./FileUtils");
var ts_1 = require("./ts");
var path = require("path");
var threeImportMap_1 = require("./threeImportMap");
var walk_1 = require("../../common/walk");
var currentPath = path.resolve(__dirname, '../../..');
exports.srcPath = path.resolve(currentPath, 'src');
function esbuild_entries(srcPath) {
    return (0, walk_1.walk)(srcPath, FileUtils_1.has_allowed_extension);
}
exports.esbuild_entries = esbuild_entries;
exports.outdir = './dist/src';
exports.POLYGONJS_VERSION = JSON.stringify(require('../../../package.json').version);
function getOptions() {
    var target = (0, ts_1.getTarget)();
    if (!target) {
        throw 'no target found in tsconfig.json. is the file present?';
    }
    if (typeof target != 'string') {
        throw 'target is not a string';
    }
    console.log("currentPath: ".concat(currentPath));
    console.log("srcPath: ".concat(exports.srcPath));
    var files_list = esbuild_entries(exports.srcPath);
    console.log("esbuild: transpiling ".concat(files_list.length, " files"));
    var options = {
        // entryPoints: ['./src/engine/index.ts'],
        entryPoints: files_list,
        target: target,
        outdir: exports.outdir,
        // minify: true,
        // minifyWhitespace: false,
        // minifyIdentifiers: false,
        // minifySyntax: false,
        // bundle: true,
        // external: ['require', 'fs', 'path'],
        define: {
            __POLYGONJS_VERSION__: exports.POLYGONJS_VERSION,
            'process.env.NODE_ENV': '"production"'
        },
        loader: {
            '.glsl': 'text'
        },
        plugins: [threeImportMap_1.threeImportMapsOnResolvePlugin]
    };
    return options;
}
exports.getOptions = getOptions;
