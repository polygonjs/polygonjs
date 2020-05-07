"use strict";
exports.__esModule = true;
var esbuild_1 = require("esbuild");
var out = './dist/out.js';
var options = {
    stdio: 'inherit',
    entryPoints: ['./src/engine/index.ts'],
    target: 'esnext',
    outfile: out,
    minify: true,
    bundle: true,
    define: {
        'process.env.NODE_ENV': '"development"'
    },
    external: ['require', 'fs', 'path'],
    loader: {
        '.glsl': 'text'
    }
};
esbuild_1.build(options)["catch"](function () { return process.exit(1); });
