const TYPESCRIPT_TRANSPILE_ONLY = true;

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// make sure to sync those paths in:
// - tsconfig.js
// - jest.config.js
const alias = {
	src: path.resolve(__dirname, '../src'),
	modules: path.resolve(__dirname, '../modules/'),
	tests: path.resolve(__dirname, '../tests/'),
};
const plugins = [
	new CleanWebpackPlugin(),
	new HtmlWebpackPlugin({
		title: 'Index',
		// filename: 'index.html',
		chunks: ['polygonjs-engine'],
	}),
];

if (TYPESCRIPT_TRANSPILE_ONLY) {
	plugins.push(new ForkTsCheckerWebpackPlugin());
}

module.exports = {
	context: path.resolve(__dirname, '../'), // to automatically find tsconfig.json
	entry: {
		'polygonjs-engine': './src/index.ts',
	},
	plugins: plugins,
	output: {
		// filename: '[name].bundle.js'
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		library: 'POLY',
	},
	resolve: {
		// modules: [path.resolve(__dirname, '../node_modules')],
		extensions: ['.ts', '.js'],
		alias: alias,
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: TYPESCRIPT_TRANSPILE_ONLY,
							experimentalWatchApi: true,
						},
					},
				],
			},
			// this loader is not required, as is replaced by custom_typings/glsl.d.ts
			// (from: https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript)
			// {
			// 	test: /\.glsl$/,
			// 	use: [{loader: 'ts-shader-loader'}],
			// },
		],
	},
};
