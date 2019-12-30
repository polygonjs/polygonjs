const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
	entry: {
		'polygonjs-engine': './src/index.ts',
		test: './test/index.ts',
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'Index',
			// filename: 'index.html',
			chunks: ['polygonjs-engine'],
		}),
		new HtmlWebpackPlugin({
			title: 'Test',
			filename: 'test',
			template: 'test/index.html',
			chunks: ['test'],
		}),
	],
	output: {
		// filename: '[name].bundle.js'
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		library: 'POLY',
	},
	resolve: {
		extensions: ['.ts', '.js'],
		alias: {
			src: path.resolve(__dirname, '../src'),
		},
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
