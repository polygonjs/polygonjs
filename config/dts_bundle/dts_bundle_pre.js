"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var walk_1 = require("../common/walk");
var common_1 = require("./common");
var TS_IGNORE = '// @ts-ignore';
function copyMissingDtsFiles() {
    fs.copyFileSync(path.join(common_1.polygonjsRoot, 'src/core/particles/gpuCompute/GPUComputationRenderer.d.ts'), path.join(common_1.polygonjsDist, 'src/core/particles/gpuCompute/GPUComputationRenderer.d.ts'));
    fs.copyFileSync(path.join(common_1.polygonjsRoot, 'src/core/render/PBR/three-gpu-pathtracer.d.ts'), path.join(common_1.polygonjsDist, 'src/core/render/PBR/three-gpu-pathtracer.d.ts'));
    fs.copyFileSync(path.join(common_1.polygonjsRoot, 'src/core/render/post/n8ao.d.ts'), path.join(common_1.polygonjsDist, 'src/core/render/post/n8ao.d.ts'));
    // fs.copyFileSync(
    // 	path.join(polygonjsRoot, 'src/core/geometry/cad/build/polygonjs-occt.d.ts'),
    // 	path.join(polygonjsDist, 'src/core/geometry/cad/build/polygonjs-occt.d.ts')
    // );
    fs.copyFileSync(path.join(common_1.polygonjsRoot, 'src/modules/core/controls/OrbitControls.d.ts'), path.join(common_1.polygonjsDist, 'src/modules/core/controls/OrbitControls.d.ts'));
}
function setTsIgnoreToParamAccessorFiles() {
    var paramFileNames = ['ParamsAccessor', 'ParamsValueAccessor'];
    for (var _i = 0, paramFileNames_1 = paramFileNames; _i < paramFileNames_1.length; _i++) {
        var paramFileName = paramFileNames_1[_i];
        var filePath = path.join(common_1.polygonjsDist, "src/engine/nodes/utils/params/".concat(paramFileName, ".d.ts"));
        var content = fs.readFileSync(filePath, 'utf-8');
        var lines = content.split('\n');
        var newLines = [];
        for (var _a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
            var line = lines_1[_a];
            if (line.includes(' T[P]')) {
                newLines.push(TS_IGNORE);
            }
            newLines.push(line);
        }
        fs.writeFileSync(filePath, newLines.join('\n'));
    }
}
function fixGsap() {
    var GSAP_TYPE = ': gsap.core.Timeline';
    var GSAP_GLOBAL_THIS = ': typeof globalThis.gsap';
    var GSAP_SCROLLTRIGGER = ': typeof ScrollTrigger';
    var ANY = ': any';
    var SCROLL_TRIGGER_IMPORT = "import ScrollTrigger from 'gsap/ScrollTrigger';";
    function is_dts(file_path) {
        var elements = file_path.split('.');
        elements.shift();
        var fullExt = elements.join('.');
        return fullExt == 'd.ts';
    }
    var filePaths = (0, walk_1.walk)(path.join(common_1.polygonjsDist, 'src'), is_dts);
    function replaceGsapTypesByAny() {
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var filePath = filePaths_1[_i];
            var content = fs.readFileSync(filePath, 'utf-8');
            var lines = content.split('\n');
            var newLines = [];
            for (var _a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
                var line = lines_2[_a];
                if (line.includes(GSAP_TYPE)) {
                    line = line.replace(GSAP_TYPE, ANY);
                }
                if (line.includes(GSAP_GLOBAL_THIS)) {
                    line = line.replace(GSAP_GLOBAL_THIS, ANY);
                }
                if (line.includes(GSAP_SCROLLTRIGGER)) {
                    line = line.replace(GSAP_SCROLLTRIGGER, ANY);
                }
                newLines.push(line);
            }
            fs.writeFileSync(filePath, newLines.join('\n'));
        }
    }
    function addTsIgnoreToGsapImport() {
        for (var _i = 0, filePaths_2 = filePaths; _i < filePaths_2.length; _i++) {
            var filePath = filePaths_2[_i];
            var content = fs.readFileSync(filePath, 'utf-8');
            var lines = content.split('\n');
            var newLines = [];
            for (var _a = 0, lines_3 = lines; _a < lines_3.length; _a++) {
                var line = lines_3[_a];
                if (line.includes(SCROLL_TRIGGER_IMPORT)) {
                    newLines.push(TS_IGNORE);
                }
                newLines.push(line);
            }
            fs.writeFileSync(filePath, newLines.join('\n'));
        }
    }
    replaceGsapTypesByAny();
    addTsIgnoreToGsapImport();
}
function fixOpencascade() {
    // in file dist/src/core/geometry/cad/CadCommon.d.ts
    // add @ts-ignore to lines containing 'from './build/polygonjs-occt';'
    var filePath = path.join(common_1.polygonjsDist, 'src/core/geometry/cad/CadCommon.d.ts');
    var content = fs.readFileSync(filePath, 'utf-8');
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_4 = lines; _i < lines_4.length; _i++) {
        var line = lines_4[_i];
        if (line.includes("from './build/polygonjs-occt';")) {
            newLines.push("// @ts-ignore");
            newLines.push(line);
        }
        else {
            newLines.push(line);
        }
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
function fixManifold() {
    // in file dist/src/core/geometry/sdf/SDFCommon.d.ts
    // add @ts-ignore to lines containing 'from './manifold/manifold';'
    var filePath = path.join(common_1.polygonjsDist, 'src/core/geometry/sdf/SDFCommon.d.ts');
    var content = fs.readFileSync(filePath, 'utf-8');
    var lines = content.split('\n');
    var newLines = [];
    for (var _i = 0, lines_5 = lines; _i < lines_5.length; _i++) {
        var line = lines_5[_i];
        if (line.includes("from './manifold/manifold'")) {
            newLines.push("// @ts-ignore");
            newLines.push(line);
        }
        else {
            newLines.push(line);
        }
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}
copyMissingDtsFiles();
setTsIgnoreToParamAccessorFiles();
fixGsap();
fixOpencascade();
fixManifold();
