const CREATE_TEST_INDEX = true;

const merge = require('webpack-merge');
const common = require('./common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env) => {
	const common_options = common(env);

	// load test index file
	if (CREATE_TEST_INDEX) {
		common_options.entry.test = './tests/index.ts';
		common_options.plugins.push(
			new HtmlWebpackPlugin({
				title: 'Test',
				filename: 'test',
				template: 'tests/index.html',
				chunks: ['test'],
			})
		);
	}

	return merge(common_options, {
		mode: 'development',
		devtool: 'inline-source-map', // 'cheap-module-eval-source-map',
		devServer: {
			contentBase: path.join(__dirname, '../public'),
			hot: true,
		},
	});
};
