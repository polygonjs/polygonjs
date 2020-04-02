"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
// const ENTRY = path.resolve(__dirname, '../dist/engine/index.d.ts')
var ENTRY = path_1["default"].resolve(__dirname, '../dist/src/engine/nodes/event/Code.d.ts');
var OUT_D_TS = path_1["default"].resolve(__dirname, '../dist/bundled_types.d.ts');
var EXCLUDED_FOLDER = path_1["default"].resolve(__dirname, '../dist/modules');
var IGNORED_NODE_MODULES = ['@dagrejs'];
var NODE_MODULES = ['three', 'lodash'].concat(IGNORED_NODE_MODULES);
var IGNORED_NODE_MODULE_PATHS = IGNORED_NODE_MODULES.map(function (name) {
    return path_1["default"].resolve(__dirname, '../node_modules', name);
});
var Controller = /** @class */ (function () {
    function Controller() {
        this.assembled_lines = [];
        this._files_count = 0;
        this.visited_file_trackers_by_path = new Map();
    }
    Controller.prototype.resolve_path = function (path, level) {
        if (level > 20) {
            console.warn('reached max level');
            return;
        }
        var existing = this.visited_file_trackers_by_path.get(path);
        if (existing) {
            return existing;
        }
        else {
            var file_tracker = new FileTracker(path, this, level);
            this.visited_file_trackers_by_path.set(path, file_tracker);
            this._files_count++;
            this.resolve_tracker(file_tracker);
            return file_tracker;
        }
    };
    Controller.prototype.resolve_tracker = function (file_tracker) {
        file_tracker.resolve(this.assembled_lines);
    };
    Controller.prototype.files_count = function () {
        return this._files_count;
    };
    return Controller;
}());
var FileTracker = /** @class */ (function () {
    function FileTracker(path, controller, level) {
        this.path = path;
        this.controller = controller;
        this.level = level;
        this._import_lines_indices = [];
        this._lines = fs_1["default"].readFileSync(path, 'utf8').split('\n');
    }
    FileTracker.prototype.resolve = function (assembled_lines) {
        var line;
        for (var i = 0; i < this._lines.length; i++) {
            line = this._lines[i];
            if (line.startsWith('import {')) {
                this._import_lines_indices.push(i);
                var import_relative_path = this._import_relative_path(i);
                var full_path = path_1["default"].resolve(this.path, '..', import_relative_path);
                var first_folder = import_relative_path.split('/')[0];
                if (NODE_MODULES.includes(first_folder)) {
                    full_path = path_1["default"].resolve(__dirname, '../node_modules', import_relative_path);
                }
                if (!this._ignore_file(full_path)) {
                    // if (!fs.existsSync(full_path)) {
                    // 	console.log(`file does not exist`, full_path, 'from', this.path, 'line:', line, i);
                    // 	throw 'bad file import';
                    // }
                    if (fs_1["default"].existsSync(full_path)) {
                        var tracker = this.controller.resolve_path(full_path, this.level + 1);
                    }
                }
            }
            else {
                assembled_lines.push(line);
            }
        }
    };
    FileTracker.prototype._ignore_file = function (path) {
        if (path.startsWith(EXCLUDED_FOLDER)) {
            return true;
        }
        for (var _i = 0, IGNORED_NODE_MODULE_PATHS_1 = IGNORED_NODE_MODULE_PATHS; _i < IGNORED_NODE_MODULE_PATHS_1.length; _i++) {
            var m = IGNORED_NODE_MODULE_PATHS_1[_i];
            if (path.startsWith(m)) {
                return true;
            }
        }
        return false;
    };
    FileTracker.prototype._import_relative_path = function (line_index) {
        var line = this._lines[line_index];
        if (line.includes(';')) {
            var line_elements = line.split("'");
            var import_relative_path = line_elements[line_elements.length - 2] + '.d.ts';
            return import_relative_path;
        }
        else {
            return this._import_relative_path(line_index + 1);
        }
    };
    return FileTracker;
}());
var controller = new Controller();
controller.resolve_path(ENTRY, 0);
fs_1["default"].writeFileSync(OUT_D_TS, controller.assembled_lines.join('\n'));
console.log("written " + controller.assembled_lines.length + " lines fom " + controller.files_count() + " files in ", OUT_D_TS);
