// import {build} from 'esbuild';
// import {BuildOptions} from 'esbuild/lib/main';

import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string) {
	const file_list: string[] = [];
	const list = fs.readdirSync(dir);
	for (let item of list) {
		const stat = fs.statSync(item);
		if (stat && stat.isDirectory()) {
			const sub_list = walk(item);
			for (let sub_item of sub_list) {
				file_list.push(sub_item);
			}
		} else {
			const file_path = path.resolve(dir, item);
			file_list.push(file_path);
		}
	}
	return file_list;
}
const list = walk(path.resolve(__dirname, 'src'));
console.log('list', list, list.length);

// // const out = './dist/out.js';
// const outdir = './dist/';

// const options: BuildOptions = {
// 	entryPoints: ['./src/engine/index.ts'],
// 	target: 'esnext',
// 	outdir: outdir,
// 	// minify: true,
// 	// minifyWhitespace: false,
// 	// minifyIdentifiers: false,
// 	// minifySyntax: false,
// 	// bundle: true,
// 	external: ['require', 'fs', 'path'],
// 	loader: {
// 		'.glsl': 'text',
// 	},
// };

// build(options).catch(() => process.exit(1));
