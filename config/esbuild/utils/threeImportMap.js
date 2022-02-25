"use strict";
exports.__esModule = true;
exports.threeImportMapsOnResolvePlugin = void 0;
var path = require("path");
var currentPath = path.resolve(__dirname, '../../..');
var nodeModulesPath = path.resolve(currentPath, 'node_modules');
exports.threeImportMapsOnResolvePlugin = {
    name: 'example',
    setup: function (build) {
        // Redirect all paths starting with "images/" to "./public/images/"
        build.onResolve({ filter: /^three\/src/ }, function (args) {
            var elements = args.path.split('.');
            var ext = elements[elements.length - 1];
            var newPath = path.join(nodeModulesPath, "" + args.path);
            if (ext != 'js') {
                newPath = newPath + ".js";
            }
            if (ext == 'html') {
                return { path: newPath, external: true };
            }
            return { path: newPath };
        });
        //   // Mark all paths starting with "http://" or "https://" as external
        //   build.onResolve({ filter: /^https?:\/\// }, (args:any) => {
        // 	return { path: args.path, external: true }
        //   })
    }
};
