const merge = require('webpack-merge');
const common = require('./common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
	return merge(common, {
		mode: 'production',
		optimization: {
			minimize: true,
			minimizer: [new TerserPlugin()],

			// from example 1 in https://webpack.js.org/plugins/split-chunks-plugin/
			// to only extract what is common between entry points
			// splitChunks: {
			// 	cacheGroups: {
			// 		commons: {
			// 			name: 'commons',
			// 			chunks: 'initial',
			// 			minChunks: 2,
			// 		},
			// 	},
			// },
			// from example 2 in https://webpack.js.org/plugins/split-chunks-plugin/
			// to only extract libs from node_modules
			// splitChunks: {
			// 	cacheGroups: {
			// 		commons: {
			// 			test: /[\\/]node_modules[\\/]/,
			// 			name: 'vendors',
			// 			chunks: 'all',
			// 		},
			// 	},
			// },

			// from example 3 in https://webpack.js.org/plugins/split-chunks-plugin/
			// to split node_modules by name
			splitChunks: {
				cacheGroups: {
					// commons: {
					// 	name: 'commons',
					// 	chunks: 'all',
					// 	minChunks: 2,
					// 	priority: 2,
					// },
					three: {
						test: /\/node_modules\/three\//,
						name: 'three',
						chunks: 'all',
						priority: 10,
					},
					lodash: {
						test: /\/node_modules\/lodash\//,
						name: 'lodash',
						chunks: 'all',
						priority: 10,
					},
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendor',
						chunks: 'all',
						priority: 1,
					},
				},
			},
		},
	});
};
