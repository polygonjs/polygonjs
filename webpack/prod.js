const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const path = require('path');
const LOGO_PATH = path.resolve(__dirname, '../public/images/logo.256.png');

const merge = require('webpack-merge');
const common = require('./common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
var {AggressiveMergingPlugin} = require('webpack').optimize;

module.exports = (env) => {
	const common_options = common(env);

	// common_options.plugins.push(new UglifyJsWebpackPlugin()); //minify everything // no need, terser (below is better)
	if (!FAST_COMPILE) {
		common_options.plugins.push(new AggressiveMergingPlugin()); //Merge chunks
		common_options.plugins.push(new FaviconsWebpackPlugin(LOGO_PATH));
		common_options.plugins.push(new CompressionPlugin()); // gs by default
		common_options.plugins.push(
			new CompressionPlugin({
				filename: '[path].br[query]',
				algorithm: 'brotliCompress',
				test: /\.(js|css|html|svg)$/,
				compressionOptions: {level: 11},
				threshold: 10240,
				minRatio: 0.8,
			})
		);
	}

	common_options.output.chunkFilename = '[name].bundle.js';
	if (env.PUBLIC_PATH) {
		common_options.output.publicPath = env.PUBLIC_PATH; // this may be crucial to update depending on the build
	}

	return merge(common_options, {
		mode: 'production',
		devtool: 'source-map',
		optimization: {
			chunkIds: 'named',
			minimize: !FAST_COMPILE,
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
			// splitChunks: {
			// 	chunks: 'all',
			// 	// maxSize: 1000000,
			// 	// minChunks: 4,
			// 	// maxInitialRequests: 100000,
			// 	// maxAsyncRequests: 100000,
			// 	// cacheGroups: {
			// 	// 	// commons: {
			// 	// 	// 	name: 'commons',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	minChunks: 20,
			// 	// 	// 	priority: 2,
			// 	// 	// },
			// 	// 	// three: {
			// 	// 	// 	test: /\/node_modules\/three\//,
			// 	// 	// 	name: 'three',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// },
			// 	// 	// regl: {
			// 	// 	// 	test: /\/node_modules\/(regl)|(gl-matrix)|(gl-ve3)|(gl-mat4)\//,
			// 	// 	// 	name: 'regl',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// },
			// 	// 	// opentype: {
			// 	// 	// 	test: /\/node_modules\/opentype.js\//,
			// 	// 	// 	name: 'opentype',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// },
			// 	// 	// lodash: {
			// 	// 	// 	test: /\/node_modules\/lodash\//,
			// 	// 	// 	name: 'lodash',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// },
			// 	// 	// vendors: {
			// 	// 	// 	test: /[\\/]node_modules[\\/]/,
			// 	// 	// 	name: 'vendors',
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 1,
			// 	// 	// },
			// 	// 	// modules_three: {
			// 	// 	// 	test: /\/modules\/three\//,
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// 	name: function(module, chunks, cacheGroupKey) {
			// 	// 	// 		const moduleFileName = module
			// 	// 	// 			.identifier()
			// 	// 	// 			.split('/')
			// 	// 	// 			.reduceRight((item) => item);
			// 	// 	// 		const allChunksNames = chunks.map((item) => item.name).join('~');
			// 	// 	// 		return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
			// 	// 	// 	},
			// 	// 	// },
			// 	// 	// nodes: {
			// 	// 	// 	test: /\/src\/engine\/nodes\//,
			// 	// 	// 	chunks: 'all',
			// 	// 	// 	priority: 10,
			// 	// 	// 	name: function(module, chunks, cacheGroupKey) {
			// 	// 	// 		const elements = module.identifier().split('/');
			// 	// 	// 		let moduleFileName = [elements[elements.length - 2], elements[elements.length - 1]].join(
			// 	// 	// 			'_'
			// 	// 	// 		);
			// 	// 	// 		moduleFileName = moduleFileName.split('.')[0];
			// 	// 	// 		// const moduleFileName = module
			// 	// 	// 		// 	.identifier()
			// 	// 	// 		// 	.split('/')
			// 	// 	// 		// 	.reduceRight((item) => item);
			// 	// 	// 		const allChunksNames = chunks.map((item) => item.name).join('~');
			// 	// 	// 		return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
			// 	// 	// 	},
			// 	// 	// },
			// 	// },
			// },
		},
	});
};
