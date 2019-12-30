const merge = require('webpack-merge');
const common = require('./common.js');

module.exports = env => {

	console.log('NODE_ENV: ', env.NODE_ENV);
	console.log('Production: ', env.production);

	return merge(common, {
		mode: 'development',
		devtool: 'inline-source-map',
		devServer: {
			contentBase: '../dist',
			hot: true,
		},
	});
}