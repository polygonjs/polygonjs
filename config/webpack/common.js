const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const TYPESCRIPT_TRANSPILE_ONLY = FAST_COMPILE;

// IN CASE OF CRASHES WHEN BUILDING
// - try and deactivate experimentalWatchApi in ts-loader
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const html = require('./loaders/html');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

// loaders
const glsl = require('./loaders/glsl');
const ts = require('./loaders/ts');
const opencascade = require('./loaders/opencascade');

const POLYGONJS_VERSION = JSON.stringify(require('../../package.json').version);

const plugins = [
	new HtmlWebpackPlugin({
		title: 'Index',
		filename: 'index.html',
		chunks: ['all'],
		scriptLoading: 'module',
	}),
	new MiniCssExtractPlugin({
		filename: '[name].css',
	}),
	new webpack.DefinePlugin({
		__POLYGONJS_VERSION__: POLYGONJS_VERSION,
	}),
];

// if (TYPESCRIPT_TRANSPILE_ONLY) {
// no need for this for now, since I only do transpile_only when doing quick test
// and the point is to build fast
plugins.push(new ForkTsCheckerWebpackPlugin());
// }

module.exports = (options = {}) => {
	// const dist_path = path.resolve(__dirname, env.DIST_PATH ? env.DIST_PATH : '../../dist');

	const config = {
		context: path.resolve(__dirname, '../../'), // to automatically find tsconfig.json
		entry: {
			all: {
				import: './src/engine/index_all.ts',
				dependOn: 'shared',
			},
			shared: [
				//'jscad',// no jscad here, as it makes it easier to track if it is included by CoreGroup or not
				'gsap',
				'mapbox-gl',
				'postprocessing',
				'three',
				'three-bvh-csg',
				'three-gpu-pathtracer',
				'three-mesh-bvh',
			],
		},
		plugins: plugins,

		output: {
			filename: '[name].js',
			// // library: 'POLY',
			// // libraryTarget: 'window',
			// libraryExport: 'default',
			// libraryTarget: 'commonjs2',
			// auxiliaryComment: {
			// 	root: 'Root Comment',
			// 	commonjs: 'CommonJS Comment',
			// 	commonjs2: 'CommonJS2 Comment',
			// 	amd: 'AMD Comment',
			// },
			// iife: false,
			// libraryTarget: 'module',
			// scriptType: 'module',
			// libraryTarget: 'commonjs',
			// this has been moved to prod.js
			// options for https://github.com/purtuga/esm-webpack-plugin
			// library: 'POLY',
			// libraryTarget: 'var',
		},
		resolve: {
			// modules: [path.resolve(__dirname, '../../node_modules')],
			extensions: ['.ts', '.js'],
			fallback: {
				fs: false, // to attempt bundling ammo-typed without error in prod
				path: false, // opencascade
				assert: false, // opencascade
				crypto: false, // opencascade
				util: false, // opencascade
			},
		},
		module: {
			rules: [
				// engine
				ts(),
				glsl,
				opencascade,
			],
		},
		experiments: {
			asyncWebAssembly: true, // wasm (rapier physics)
		},
		ignoreWarnings: [
			{
				module: /web-ifc/,
				message: /require function is used in a way in which dependencies cannot be statically extracted/,
			},
		],
	};

	config.module.rules.push(html);
	if (options.createExamples) {
		config.entry.example = {
			import: './src/engine/example.ts',
			dependOn: 'shared',
		};
		config.plugins.push(
			new HtmlWebpackPlugin({
				title: 'Example',
				filename: 'example.html',
				template: './src/engine/example.html',
				chunks: ['example'],
			})
		);
	}
	if (options.registerAll) {
		config.entry.registerAll = {
			import: './src/engine/registerAll.ts',
			dependOn: 'shared',
		};
		config.plugins.push(
			new HtmlWebpackPlugin({
				title: 'registerAll',
				filename: 'registerAll.html',
				template: './src/engine/registerAll.html',
				chunks: ['registerAll'],
			})
		);
	}

	return config;
};
