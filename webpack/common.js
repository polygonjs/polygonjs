const TYPESCRIPT_TRANSPILE_ONLY = false;

// IN CASE OF CRASHES WHEN BUILDING
// - try and deactivate experimentalWatchApi in ts-loader

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// loaders
const glsl = require('./loaders/glsl');
const ts = require('./loaders/ts');

const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		title: 'Index',
		// filename: 'index.html',
		chunks: ['polygonjs-engine'],
	}),
	new MiniCssExtractPlugin({
		filename: '[name].css',
	}),
];

if (TYPESCRIPT_TRANSPILE_ONLY) {
	plugins.push(new ForkTsCheckerWebpackPlugin());
}

module.exports = (env = {}) => ({
	context: path.resolve(__dirname, '../'), // to automatically find tsconfig.json
	entry: {
		'polygonjs-engine': './src/engine/index.ts',
	},
	plugins: plugins,
	output: {
		library: 'POLY',
		// libraryTarget: 'umd',

		libraryTarget: 'window',
		// globalObject: 'this',

		// filename: '[name].bundle.js'
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		// library: 'POLY',
	},
	resolve: {
		// modules: [path.resolve(__dirname, '../node_modules')],
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			// engine
			ts(env, TYPESCRIPT_TRANSPILE_ONLY),
			glsl,
		],
	},
});
