const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

// make sure to sync those paths in:
// - tsconfig.js
// - jest.config.js
const alias = {
	src: path.resolve(__dirname, '../src'),
	modules: path.resolve(__dirname, '../modules/'),
	tests: path.resolve(__dirname, '../tests/'),
}
console.log(path.resolve(__dirname, '../tsconfig.json'))

module.exports = {
	entry: {
		'polygonjs-engine': './src/index.ts',
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'Index',
			// filename: 'index.html',
			chunks: ['polygonjs-engine'],
		}),
	],
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
							// transpileOnly: true,
							experimentalWatchApi: true,
						},
					},
				],
			},
		],
	},
}
