"use strict";
exports.__esModule = true;
exports.walk = void 0;
var path = require('path');
var fs = require('fs');
function walk(dir, filterCallback) {
    var files_list = [];
    var list = fs.readdirSync(dir);
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        var file_path = path.resolve(dir, item);
        var stat = fs.statSync(file_path);
        if (stat && stat.isDirectory()) {
            var sub_list = walk(file_path, filterCallback);
            for (var _a = 0, sub_list_1 = sub_list; _a < sub_list_1.length; _a++) {
                var sub_item = sub_list_1[_a];
                files_list.push(sub_item);
            }
        }
        else {
            files_list.push(file_path);
        }
    }
    var accepted_file_list = files_list.filter(filterCallback);
    return accepted_file_list;
}
exports.walk = walk;
