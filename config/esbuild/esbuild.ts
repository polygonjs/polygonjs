import {build} from 'esbuild';
import {BuildOptions} from 'esbuild/lib/main';

import * as fs from 'fs';
import * as path from 'path';

const allowed_extensions = ['js', 'ts'];
function has_allowed_extension(file_path: string) {
	const elements = file_path.split('.');
	elements.shift();
	const ext = elements.join('.');
	return allowed_extensions.includes(ext);
}

function walk(dir: string) {
	const files_list: string[] = [];
	const list = fs.readdirSync(dir);
	for (let item of list) {
		const file_path = path.resolve(dir, item);
		const stat = fs.statSync(file_path);
		if (stat && stat.isDirectory()) {
			const sub_list = walk(file_path);
			for (let sub_item of sub_list) {
				files_list.push(sub_item);
			}
		} else {
			files_list.push(file_path);
		}
	}

	const accepted_file_list = files_list.filter((file_path) => has_allowed_extension(file_path));

	return accepted_file_list;
}
const files_list = walk(path.resolve(__dirname, '../../src'));
console.log(`esbuild: transpiling ${files_list.length} files`);

// // const out = './dist/out.js';
const outdir = './dist/src';
const POLYGONJS_VERSION = JSON.stringify(require('../../package.json').version);

const options: BuildOptions = {
	// entryPoints: ['./src/engine/index.ts'],
	entryPoints: files_list,
	target: 'esnext',
	outdir: outdir,
	// minify: true,
	// minifyWhitespace: false,
	// minifyIdentifiers: false,
	// minifySyntax: false,
	// bundle: true,
	// external: ['require', 'fs', 'path'],
	define: {__POLYGONJS_VERSION__: POLYGONJS_VERSION},
	loader: {
		'.glsl': 'text',
	},
};

build(options).catch(() => process.exit(1));
