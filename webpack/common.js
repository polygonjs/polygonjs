const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

// console.log(
// 	'__dirname',
// 	__dirname,
// 	path.resolve(__dirname, '../dist'),
// 	path.resolve(__dirname, '../node_modules'),
// 	path.resolve(__dirname, '../node_modules/three')
// )

// make sure to sync those paths in tsconfig.js
const alias = {
	src: path.resolve(__dirname, '../src/'),
	modules: path.resolve(__dirname, '../modules/'),
}

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
