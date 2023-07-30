"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polygonjsDist = exports.polygonjsRoot = void 0;
var path = require("path");
var polygonjsRoot = path.resolve(__dirname, '../..');
exports.polygonjsRoot = polygonjsRoot;
var polygonjsDist = path.join(polygonjsRoot, 'dist');
exports.polygonjsDist = polygonjsDist;
