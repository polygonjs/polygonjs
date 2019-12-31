const merge = require('webpack-merge')
const common = require('./common.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
	// console.log('NODE_ENV: ', env.NODE_ENV)
	// console.log('Production: ', env.production)

	common.entry.test = './test/index.ts'

	common.plugins.push(
		new HtmlWebpackPlugin({
			title: 'Test',
			filename: 'test',
			template: 'test/index.html',
			chunks: ['test'],
		})
	)

	return merge(common, {
		mode: 'development',
		devtool: 'inline-source-map',
		devServer: {
			contentBase: '../dist',
			hot: true,
		},
	})
}
