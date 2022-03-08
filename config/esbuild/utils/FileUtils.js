"use strict";
exports.__esModule = true;
exports.has_allowed_extension = void 0;
var disallowed_long_extensions = ['d.ts'];
var allowed_extensions = ['js', 'ts', 'glsl'];
function has_allowed_extension(file_path) {
    var elements = file_path.split('.');
    elements.shift();
    var long_ext = elements.join('.');
    var short_ext = elements[elements.length - 1];
    return allowed_extensions.includes(short_ext) && !disallowed_long_extensions.includes(long_ext);
}
exports.has_allowed_extension = has_allowed_extension;
