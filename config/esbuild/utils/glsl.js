"use strict";
exports.__esModule = true;
exports.fix_glsl_files = void 0;
var fs = require("fs");
var FileUtils_1 = require("./FileUtils");
function fix_glsl_files(srcPath) {
    // then we rename the glsl files that have been transpile from bla.glsl to bla.js into bla.glsl.js:
    var glsl_files = find_glsl_files(srcPath);
    var current_path = process.cwd();
    for (var _i = 0, glsl_files_1 = glsl_files; _i < glsl_files_1.length; _i++) {
        var glsl_file = glsl_files_1[_i];
        var short_path_glsl = glsl_file.replace(current_path + "/", '');
        var short_path_no_ext = short_path_glsl.replace(".glsl", '');
        var short_path_js = short_path_no_ext + ".js";
        var dest_path_js = "dist/" + short_path_js;
        var new_dest_path = "dist/" + short_path_no_ext + ".glsl.js";
        // console.log(dest_path_js);
        if (fs.existsSync(dest_path_js)) {
            fs.renameSync(dest_path_js, new_dest_path);
        }
        else {
            console.error("!!! " + dest_path_js + " not found");
        }
    }
}
exports.fix_glsl_files = fix_glsl_files;
function is_glsl(file_path) {
    var elements = file_path.split('.');
    var short_ext = elements[elements.length - 1];
    return short_ext == 'glsl';
}
function find_glsl_files(srcPath) {
    return (0, FileUtils_1.walk)(srcPath, is_glsl);
}
