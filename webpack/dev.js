const merge = require('webpack-merge');
const common = require('./common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env) => {
	const common_options = common(env);
	// console.log('env', env);
	// console.log('common_options', common_options);
	// console.log('NODE_ENV: ', env.NODE_ENV)
	// console.log('Production: ', env.production)

	// common_options.entry.test = './tests/index.ts';

	// common_options.plugins.push(
	// 	new HtmlWebpackPlugin({
	// 		title: 'Test',
	// 		filename: 'test',
	// 		template: 'tests/index.html',
	// 		chunks: ['test'],
	// 	})
	// );

	return merge(common_options, {
		mode: 'development',
		devtool: 'inline-source-map', //  'cheap-module-eval-source-map',
		devServer: {
			contentBase: path.join(__dirname, '../public'),
			hot: true,
		},
	});
};
