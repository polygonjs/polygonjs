import {build} from 'esbuild';
import {BuildOptions} from 'esbuild/lib/main';

import * as fs from 'fs';
import * as path from 'path';

const disallowed_long_extensions = ['d.ts'];
const allowed_extensions = ['js', 'ts', 'glsl'];
function has_allowed_extension(file_path: string) {
	const elements = file_path.split('.');
	elements.shift();
	const long_ext = elements.join('.');
	const short_ext = elements[elements.length - 1];
	return allowed_extensions.includes(short_ext) && !disallowed_long_extensions.includes(long_ext);
}
function is_glsl(file_path: string) {
	const elements = file_path.split('.');
	const short_ext = elements[elements.length - 1];
	return short_ext == 'glsl';
}

type FileCallback = (path: string) => boolean;
function walk(dir: string, filter_callback: FileCallback) {
	const files_list: string[] = [];
	const list = fs.readdirSync(dir);
	for (let item of list) {
		const file_path = path.resolve(dir, item);
		const stat = fs.statSync(file_path);
		if (stat && stat.isDirectory()) {
			const sub_list = walk(file_path, filter_callback);
			for (let sub_item of sub_list) {
				files_list.push(sub_item);
			}
		} else {
			files_list.push(file_path);
		}
	}

	const accepted_file_list = files_list.filter(filter_callback);

	return accepted_file_list;
}
function esbuild_entries() {
	return walk(path.resolve(__dirname, '../../src'), has_allowed_extension);
}
function find_glsl_files() {
	return walk(path.resolve(__dirname, '../../src'), is_glsl);
}

const files_list = esbuild_entries();
console.log(`esbuild: transpiling ${files_list.length} files`);

// // const out = './dist/out.js';
const outdir = './dist/src';
const POLYGONJS_VERSION = JSON.stringify(require('../../package.json').version);

function getTarget() {
	const tsconfig = fs.readFileSync(path.resolve(process.cwd(), './tsconfig.json'), 'utf-8');
	const lines = tsconfig.split('\n');
	let target: string = '2020';
	for (let line of lines) {
		if (line.includes('target')) {
			const new_target = line.split(': "')[1].split(',')[0].replace('"', '');
			target = new_target.toLowerCase();
		}
	}
	console.log('target', target);

	return target;
}

function getOptions() {
	const target = getTarget();
	if (!target) {
		throw 'no target found in tsconfig.json. is the file present?';
	}
	if (typeof target != 'string') {
		throw 'target is not a string';
	}
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
		define: {__POLYGONJS_VERSION__: POLYGONJS_VERSION},
		loader: {
			'.glsl': 'text',
		},
	};
	return options;
}

function fix_glsl_files() {
	// then we rename the glsl files that have been transpile from bla.glsl to bla.js into bla.glsl.js:
	const glsl_files = find_glsl_files();
	const current_path = process.cwd();
	for (let glsl_file of glsl_files) {
		const short_path_glsl = glsl_file.replace(`${current_path}/`, '');
		const short_path_no_ext = short_path_glsl.replace(`.glsl`, '');
		const short_path_js = `${short_path_no_ext}.js`;
		const dest_path_js = `dist/${short_path_js}`;
		const new_dest_path = `dist/${short_path_no_ext}.glsl.js`;
		console.log(dest_path_js);
		if (fs.existsSync(dest_path_js)) {
			fs.renameSync(dest_path_js, new_dest_path);
		} else {
			console.error(`!!! ${dest_path_js} not found`);
		}
	}
}

async function start() {
	const options = getOptions();
	console.log('options', options);
	await build(options).catch(() => {
		console.log('IN CATCH');
		process.exit(1);
	});
	fix_glsl_files();
}

start();
