"use strict";
//
// converted to typescript from https://github.com/trygve-lie/esbuild-plugin-import-map
//
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
exports.plugin = exports.clear = exports.load = void 0;
var path = require("path");
var fs = require("fs");
var isBare = function (str) {
    if (str.startsWith('/') ||
        str.startsWith('./') ||
        str.startsWith('../') ||
        str.substr(0, 7) === 'http://' ||
        str.substr(0, 8) === 'https://') {
        return false;
    }
    return true;
};
function isString(value) {
    return typeof value == 'string';
}
var validate = function (map) {
    return Object.keys(map.imports).map(function (key) {
        var value = map.imports[key];
        if (isBare(value)) {
            throw Error("Import specifier can NOT be mapped to a bare import statement. Import specifier \"" + key + "\" is being wrongly mapped to \"" + value + "\"");
        }
        return { key: key, value: value };
    });
};
var fileReader = function (pathname) {
    if (pathname === void 0) { pathname = ''; }
    return new Promise(function (resolve, reject) {
        var filepath = path.normalize(pathname);
        var file = fs.readFileSync(filepath, 'utf-8');
        try {
            var obj = JSON.parse(file);
            resolve(validate(obj));
        }
        catch (error) {
            reject(error);
        }
    });
};
var CACHE = new Map();
function load(importMaps) {
    return __awaiter(this, void 0, void 0, function () {
        var maps, mappings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maps = Array.isArray(importMaps) ? importMaps : [importMaps];
                    mappings = maps.map(function (item) {
                        if (isString(item)) {
                            return fileReader(item);
                        }
                        return validate(item);
                    });
                    return [4 /*yield*/, Promise.all(mappings).then(function (items) {
                            items.forEach(function (item) {
                                item.forEach(function (obj) {
                                    CACHE.set(obj.key, obj.value);
                                });
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.load = load;
function clear() {
    CACHE.clear();
}
exports.clear = clear;
function plugin() {
    return {
        name: 'importMap',
        setup: function (build) {
            build.onResolve({ filter: /.*?/ }, function (args) {
                if (CACHE.has(args.path)) {
                    return {
                        path: CACHE.get(args.path),
                        namespace: args.path,
                        external: true
                    };
                }
                return {};
            });
        }
    };
}
exports.plugin = plugin;
