import {BuildOptions} from 'esbuild';
import {has_allowed_extension} from './FileUtils';
import {getTarget} from './ts';
import * as path from 'path';
import {threeImportMapsOnResolvePlugin} from './threeImportMap';
import {walk} from '../../common/walk';
const currentPath = path.resolve(__dirname, '../../..');
export const srcPath = path.resolve(currentPath, 'src');

export function esbuild_entries(srcPath: string) {
	return walk(srcPath, has_allowed_extension);
}

export const outdir = './dist/src';
export const POLYGONJS_VERSION = JSON.stringify(require('../../../package.json').version);

export function getOptions() {
	const target = getTarget();
	if (!target) {
		throw 'no target found in tsconfig.json. is the file present?';
	}
	if (typeof target != 'string') {
		throw 'target is not a string';
	}
	console.log(`currentPath: ${currentPath}`);
	console.log(`srcPath: ${srcPath}`);
	const files_list = esbuild_entries(srcPath);
	console.log(`esbuild: transpiling ${files_list.length} files`);
	const options: BuildOptions = {
		// entryPoints: ['./src/engine/index.ts'],
		entryPoints: files_list,
		target: target, //'ES2019', //'esnext', // make sure to have same target as in tsconfig.json
		outdir: outdir,
		// minify: true,
		// minifyWhitespace: false,
		// minifyIdentifiers: false,
		// minifySyntax: false,
		// bundle: true,
		// external: ['require', 'fs', 'path'],
		define: {
			__POLYGONJS_VERSION__: POLYGONJS_VERSION,
			'process.env.NODE_ENV': '"production"',
		},
		loader: {
			'.glsl': 'text',
		},
		plugins: [threeImportMapsOnResolvePlugin],

		// options to debug threejs build
		// bundle: true,
	};
	return options;
}
