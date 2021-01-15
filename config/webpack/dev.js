const CREATE_EXAMPLE_INDEX = true;
const CREATE_TEST_INDEX = true;

const fs = require('fs');
const {merge} = require('webpack-merge');
const common = require('./common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const html = require('./loaders/html');

module.exports = (env) => {
	const common_options = common(env);

	if (CREATE_EXAMPLE_INDEX) {
		common_options.entry.example = './src/engine/example.ts';
		common_options.plugins.push(
			new HtmlWebpackPlugin({
				title: 'Example',
				filename: 'example',
				template: './src/engine/example.html',
				chunks: ['example'],
			})
		);
		common_options.module.rules.push(html);
	}

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

	const config = merge(common_options, {
		mode: 'development',
		devtool: 'inline-source-map', // 'cheap-module-eval-source-map',
		devServer: {
			contentBase: path.join(__dirname, '../public'),
			hot: true,
		},
	});

	// console.log('write debug');
	const debug_config_path = path.resolve(__dirname, './debug_dev_config.json');
	fs.writeFileSync(debug_config_path, JSON.stringify(config, null, 4));

	return config;
};
