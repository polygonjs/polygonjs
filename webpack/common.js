const TYPESCRIPT_TRANSPILE_ONLY = false;

// on using vue with typescript:
// tips here: https://github.com/Microsoft/TypeScript-Vue-Starter
// to make sure .vue components are loaded
// - have a shim file (in this case custom_typings/loader_vue.d.ts)
// - add .vue to file extension
// - have all the vue loaders and options below
// the still remaining issue is that when the file path is wrong, there is no warning in the editor
// and the error message can be confusing

// IN CASE OF CRASHES WHEN BUILDING
// - try and deactivate experimentalWatchApi in ts-loader

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// loaders
const css = require('./loaders/css');
const glsl = require('./loaders/glsl');
const pug = require('./loaders/pug');
const sass = require('./loaders/sass');
const ts = require('./loaders/ts');
const vue = require('./loaders/vue');

// make sure to sync those paths in:
// - tsconfig.js
const alias = {
	src: path.resolve(__dirname, '../src'),
	modules: path.resolve(__dirname, '../modules/'),
	tests: path.resolve(__dirname, '../tests/'),
};
const plugins = [
	new VueLoaderPlugin(),
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		title: 'Index',
		// filename: 'index.html',
		chunks: ['polygonjs-engine'],
	}),
	new HtmlWebpackPlugin({
		title: 'Editor',
		filename: 'editor',
		template: 'src/editor/index.html',
		chunks: ['polygonjs-editor'],
	}),
	new MiniCssExtractPlugin({
		filename: '[name].css',
	}),
];

if (TYPESCRIPT_TRANSPILE_ONLY) {
	plugins.push(new ForkTsCheckerWebpackPlugin({vue: true}));
}

module.exports = (env = {}) => ({
	context: path.resolve(__dirname, '../'), // to automatically find tsconfig.json
	entry: {
		'polygonjs-engine': './src/engine/index.ts',
		'polygonjs-editor': './src/editor/index.ts',
	},
	plugins: plugins,
	output: {
		// filename: '[name].bundle.js'
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		// library: 'POLY',
	},
	resolve: {
		// modules: [path.resolve(__dirname, '../node_modules')],
		extensions: ['.ts', '.js', '.vue'],
		alias: alias,
	},
	module: {
		rules: [
			// engine
			ts(env, TYPESCRIPT_TRANSPILE_ONLY),
			glsl,
			// editor
			css(env),
			pug,
			sass,
			vue,
		],
	},
});
