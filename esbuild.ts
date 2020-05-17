import {build} from 'esbuild';
import {BuildOptions} from 'esbuild/lib/main';
import * as fs from 'fs';
const package_content = fs.readFileSync('package.json', 'utf8');
const package_json = JSON.parse(package_content);

const out = './dist/out.js';

const options: BuildOptions = {
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
		POLYGONJS_VERSION: `"${package_json.version}"`,
	},
	external: ['require', 'fs', 'path'],
	loader: {
		'.glsl': 'text',
	},
};

build(options).catch(() => process.exit(1));
