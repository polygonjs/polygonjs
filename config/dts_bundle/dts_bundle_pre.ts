import * as fs from 'fs';
import * as path from 'path';
import {walk} from '../common/walk';

import {polygonjsRoot, polygonjsDist} from './common';

const TS_IGNORE = '// @ts-ignore';

function copyMissingDtsFiles() {
	fs.copyFileSync(
		path.join(polygonjsRoot, 'src/core/particles/gpuCompute/GPUComputationRenderer.d.ts'),
		path.join(polygonjsDist, 'src/core/particles/gpuCompute/GPUComputationRenderer.d.ts')
	);
	fs.copyFileSync(
		path.join(polygonjsRoot, 'src/core/render/PBR/three-gpu-pathtracer.d.ts'),
		path.join(polygonjsDist, 'src/core/render/PBR/three-gpu-pathtracer.d.ts')
	);
	fs.copyFileSync(
		path.join(polygonjsRoot, 'src/core/render/post/n8ao.d.ts'),
		path.join(polygonjsDist, 'src/core/render/post/n8ao.d.ts')
	);
	// fs.copyFileSync(
	// 	path.join(polygonjsRoot, 'src/core/geometry/cad/build/polygonjs-occt.d.ts'),
	// 	path.join(polygonjsDist, 'src/core/geometry/cad/build/polygonjs-occt.d.ts')
	// );
	fs.copyFileSync(
		path.join(polygonjsRoot, 'src/modules/core/controls/OrbitControls.d.ts'),
		path.join(polygonjsDist, 'src/modules/core/controls/OrbitControls.d.ts')
	);
}

function setTsIgnoreToParamAccessorFiles() {
	const paramFileNames: string[] = ['ParamsAccessor', 'ParamsValueAccessor'];
	for (let paramFileName of paramFileNames) {
		const filePath = path.join(polygonjsDist, `src/engine/nodes/utils/params/${paramFileName}.d.ts`);
		const content = fs.readFileSync(filePath, 'utf-8');
		const lines = content.split('\n');
		const newLines: string[] = [];
		for (let line of lines) {
			if (line.includes(' T[P]')) {
				newLines.push(TS_IGNORE);
			}
			newLines.push(line);
		}
		fs.writeFileSync(filePath, newLines.join('\n'));
	}
}

function fixGsap() {
	const GSAP_TYPE = ': gsap.core.Timeline';
	const GSAP_GLOBAL_THIS = ': typeof globalThis.gsap';
	const GSAP_SCROLLTRIGGER = ': typeof ScrollTrigger';
	const ANY = ': any';
	const SCROLL_TRIGGER_IMPORT = `import ScrollTrigger from 'gsap/ScrollTrigger';`;
	function is_dts(file_path: string) {
		const elements = file_path.split('.');
		elements.shift();
		const fullExt = elements.join('.');
		return fullExt == 'd.ts';
	}
	const filePaths = walk(path.join(polygonjsDist, 'src'), is_dts);

	function replaceGsapTypesByAny() {
		for (let filePath of filePaths) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const lines = content.split('\n');
			const newLines: string[] = [];
			for (let line of lines) {
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
		for (let filePath of filePaths) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const lines = content.split('\n');
			const newLines: string[] = [];
			for (let line of lines) {
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
	// in file dist/src/core/geometry/modules/cad/CadCommon.d.ts
	// add @ts-ignore to lines containing 'from './build/polygonjs-occt';'
	const filePath = path.join(polygonjsDist, 'src/core/geometry/modules/cad/CadCommon.d.ts');
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (const line of lines) {
		if (line.includes(`from './build/polygonjs-occt';`)) {
			newLines.push(`// @ts-ignore`);
			newLines.push(line);
		} else {
			newLines.push(line);
		}
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}
function fixManifold() {
	// in file dist/src/core/geometry/modules/sdf/SDFCommon.d.ts
	// add @ts-ignore to lines containing 'from './manifold/manifold';'
	const filePath = path.join(polygonjsDist, 'src/core/geometry/modules/sdf/SDFCommon.d.ts');
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (const line of lines) {
		if (line.includes(`from './manifold/manifold'`)) {
			newLines.push(`// @ts-ignore`);
			newLines.push(line);
		} else {
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
