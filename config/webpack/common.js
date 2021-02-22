const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const TYPESCRIPT_TRANSPILE_ONLY = FAST_COMPILE;

// IN CASE OF CRASHES WHEN BUILDING
// - try and deactivate experimentalWatchApi in ts-loader

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

// loaders
const glsl = require('./loaders/glsl');
const ts = require('./loaders/ts');

const POLYGONJS_VERSION = JSON.stringify(require('../../package.json').version);

const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		title: 'Index',
		// filename: 'index.html',
		chunks: ['all'],
	}),
	new MiniCssExtractPlugin({
		filename: '[name].css',
	}),
	new webpack.DefinePlugin({
		__POLYGONJS_VERSION__: POLYGONJS_VERSION,
	}),
];

if (TYPESCRIPT_TRANSPILE_ONLY) {
	// no need for this for now, since I only do transpile_only when doing quick test
	// and the point is to build fast
	// plugins.push(new ForkTsCheckerWebpackPlugin());
}

module.exports = (env = {}) => {
	// const dist_path = path.resolve(__dirname, env.DIST_PATH ? env.DIST_PATH : '../../dist');

	return {
		context: path.resolve(__dirname, '../../'), // to automatically find tsconfig.json
		entry: {
			all: './src/engine/index_all.ts',
		},
		node: {
			fs: 'empty', // to attempt bundling ammo-typed without error in prod
		},
		plugins: plugins,

		output: {
			// filename: '[name].js',
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
		},
		module: {
			rules: [
				// engine
				ts(env, TYPESCRIPT_TRANSPILE_ONLY),
				glsl,
			],
		},
	};
};
