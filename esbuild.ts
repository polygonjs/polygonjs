import {build} from 'esbuild';
import {BuildOptions} from 'esbuild/lib/main';

const out = './dist/out.js';

const options: BuildOptions = {
	stdio: 'inherit',
	entryPoints: ['./src/engine/index.ts'],
	target: 'esnext',
	outfile: out,
	minify: true,
	bundle: true,
	define: {
		'process.env.NODE_ENV': '"development"',
		POLYGONJS_VERSION: '"1.0.23"',
	},
	external: ['require', 'fs', 'path'],
	loader: {
		'.glsl': 'text',
	},
};

build(options).catch(() => process.exit(1));
