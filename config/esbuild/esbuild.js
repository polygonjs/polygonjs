"use strict";
exports.__esModule = true;
var esbuild_1 = require("esbuild");
var fs = require("fs");
var package_content = fs.readFileSync('package.json', 'utf8');
var package_json = JSON.parse(package_content);
var out = './dist/out.js';
var options = {
    stdio: 'inherit',
    entryPoints: ['./src/engine/index.ts'],
    target: 'esnext',
    outfile: out,
    minify: true,
    // minifyWhitespace: false,
    // minifyIdentifiers: false,
    // minifySyntax: false,
    bundle: true,
    define: {
        'process.env.NODE_ENV': '"development"',
        POLYGONJS_VERSION: "\"" + package_json.version + "\""
    },
    external: ['require', 'fs', 'path'],
    loader: {
        '.glsl': 'text'
    }
};
esbuild_1.build(options)["catch"](function () { return process.exit(1); });
