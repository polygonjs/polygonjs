"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var esbuild_1 = require("esbuild");
var fs = require("fs");
var path = require("path");
var disallowed_long_extensions = ['d.ts'];
var allowed_extensions = ['js', 'ts', 'glsl'];
function has_allowed_extension(file_path) {
    var elements = file_path.split('.');
    elements.shift();
    var long_ext = elements.join('.');
    var short_ext = elements[elements.length - 1];
    return allowed_extensions.includes(short_ext) && !disallowed_long_extensions.includes(long_ext);
}
function is_glsl(file_path) {
    var elements = file_path.split('.');
    var short_ext = elements[elements.length - 1];
    return short_ext == 'glsl';
}
function walk(dir, filter_callback) {
    var files_list = [];
    var list = fs.readdirSync(dir);
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        var file_path = path.resolve(dir, item);
        var stat = fs.statSync(file_path);
        if (stat && stat.isDirectory()) {
            var sub_list = walk(file_path, filter_callback);
            for (var _a = 0, sub_list_1 = sub_list; _a < sub_list_1.length; _a++) {
                var sub_item = sub_list_1[_a];
                files_list.push(sub_item);
            }
        }
        else {
            files_list.push(file_path);
        }
    }
    var accepted_file_list = files_list.filter(filter_callback);
    return accepted_file_list;
}
function esbuild_entries() {
    return walk(path.resolve(__dirname, '../../src'), has_allowed_extension);
}
function find_glsl_files() {
    return walk(path.resolve(__dirname, '../../src'), is_glsl);
}
var files_list = esbuild_entries();
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
function fix_glsl_files() {
    // then we rename the glsl files that have been transpile from bla.glsl to bla.js into bla.glsl.js:
    var glsl_files = find_glsl_files();
    var current_path = process.cwd();
    for (var _i = 0, glsl_files_1 = glsl_files; _i < glsl_files_1.length; _i++) {
        var glsl_file = glsl_files_1[_i];
        var short_path_glsl = glsl_file.replace(current_path + "/", '');
        var short_path_no_ext = short_path_glsl.replace(".glsl", '');
        var short_path_js = short_path_no_ext + ".js";
        var dest_path_js = "dist/" + short_path_js;
        var new_dest_path = "dist/" + short_path_no_ext + ".glsl.js";
        console.log(dest_path_js);
        if (fs.existsSync(dest_path_js)) {
            fs.renameSync(dest_path_js, new_dest_path);
        }
        else {
            console.error("!!! " + dest_path_js + " not found");
        }
    }
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, esbuild_1.build(options)["catch"](function () {
                        console.log('IN CATCH');
                        process.exit(1);
                    })];
                case 1:
                    _a.sent();
                    fix_glsl_files();
                    return [2 /*return*/];
            }
        });
    });
}
start();
