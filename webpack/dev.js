const merge = require('webpack-merge');
const common = require('./common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env) => {
	// console.log('NODE_ENV: ', env.NODE_ENV)
	// console.log('Production: ', env.production)

	common.entry.test = './tests/index.ts';

	common.plugins.push(
		new HtmlWebpackPlugin({
			title: 'Test',
			filename: 'test',
			template: 'tests/index.html',
			chunks: ['test'],
		})
	);

	return merge(common, {
		mode: 'development',
		devtool: 'inline-source-map',
		devServer: {
			contentBase: path.join(__dirname, '../public'),
			hot: true,
		},
	});
};
