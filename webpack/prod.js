const merge = require('webpack-merge');
const common = require('./common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
	const common_options = common(env);

	return merge(common_options, {
		mode: 'production',
		devtool: 'source-map',
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					extractComments: true,
					parallel: true,
				}),
			],

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
				// maxSize: 1000000,
				// minChunks: 4,
				maxInitialRequests: 1000,
				maxAsyncRequests: 1000,
				cacheGroups: {
					// commons: {
					// 	name: 'commons',
					// 	chunks: 'all',
					// 	minChunks: 20,
					// 	priority: 2,
					// },
					three: {
						test: /\/node_modules\/three\//,
						name: 'three',
						chunks: 'all',
						priority: 10,
					},
					regl: {
						test: /\/node_modules\/(regl)|(gl-matrix)|(gl-ve3)|(gl-mat4)\//,
						name: 'regl',
						chunks: 'all',
						priority: 10,
					},
					opentype: {
						test: /\/node_modules\/opentype.js\//,
						name: 'opentype',
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
					modules_three: {
						test: /\/modules\/three\//,
						chunks: 'all',
						priority: 10,
						name: function(module, chunks, cacheGroupKey) {
							const moduleFileName = module
								.identifier()
								.split('/')
								.reduceRight((item) => item);
							const allChunksNames = chunks.map((item) => item.name).join('~');
							return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
						},
					},
					// nodes: {
					// 	test: /\/src\/engine\/nodes\//,
					// 	chunks: 'all',
					// 	priority: 10,
					// 	name: function(module, chunks, cacheGroupKey) {
					// 		const moduleFileName = module
					// 			.identifier()
					// 			.split('/')
					// 			.reduceRight((item) => item);
					// 		const allChunksNames = chunks.map((item) => item.name).join('~');
					// 		return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
					// 	},
					// },
				},
			},
		},
	});
};
