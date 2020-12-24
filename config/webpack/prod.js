const argv = require('yargs').argv;
const FAST_COMPILE = argv.env.FAST_COMPILE || false;
const path = require('path');
const LOGO_PATH = path.resolve(__dirname, '../../public/images/logo.256.png');
const MINIFY = true;
// having one entry per node is very hard to generate with terser and no crash
// (or it takes forever when increasing available ram for node,
// last test at a whooping 804.15s (or 329.12s without compression)
// so not exacly reasonable)
// At the moment loading multiple entry points override the POLY lib
const ONE_ENTRY_PER_NODE = false;

const POLYGONJS_VERSION = require('../../package.json').version;

const fs = require('fs');
const {merge} = require('webpack-merge');
const common = require('./common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
var {AggressiveMergingPlugin} = require('webpack').optimize;

module.exports = (env) => {
	const common_options = common(env);

	if (ONE_ENTRY_PER_NODE) {
		delete common_options.entry['all'];
		common_options.entry['engine/Poly'] = './src/engine/Poly.ts';
		common_options.entry['engine/scene/PolyScene'] = './src/engine/scene/PolyScene.ts';

		contexts = ['anim', 'cop', 'event', 'gl', 'js', 'manager', 'mat', 'obj', 'post', 'rop', 'sop'];
		const dir = './src/engine/nodes';
		for (let context of contexts) {
			const node_class_names = [];
			const context_dir = `${dir}/${context}`;
			const file_names = fs.readdirSync(context_dir);
			for (let file_name of file_names) {
				const file_path = path.resolve(context_dir, file_name);
				const stat = fs.statSync(file_path);
				if (stat && !stat.isDirectory()) {
					if (file_name[0] != '_') {
						node_class_names.push(file_name.replace('.ts', ''));
					}
				}
			}
			// console.log(`using for ${context}:`, node_class_names);
			for (let node_class_name of node_class_names) {
				const key = `engine/nodes/${context}/${node_class_name}`;
				const value = `./src/engine/nodes/${context}/${node_class_name}.ts`;
				common_options.entry[key] = value;
			}
		}

		// const entries = Object.keys(common_options.entry);
		// for (let entry of entries) {
		// 	const value = common_options.entry[entry];
		// 	delete common_options.entry[entry];
		// 	const new_entry = entry.replace(/\//g, '');
		// 	common_options.entry[new_entry] = value;
		// }
		// console.log(common_options.entry);
	}

	// common_options.plugins.push(new UglifyJsWebpackPlugin()); //minify everything // no need, terser (below is better)
	if (MINIFY) {
		common_options.plugins.push(new AggressiveMergingPlugin()); //Merge chunks
		common_options.plugins.push(new FaviconsWebpackPlugin(LOGO_PATH));
		common_options.plugins.push(
			new CompressionPlugin({
				test: /\.(js)$/,
			})
		); // gz by default
		common_options.plugins.push(
			new CompressionPlugin({
				filename: '[file].br',
				algorithm: 'brotliCompress',
				test: /\.(js|css|html|svg)$/,
				compressionOptions: {level: 11},
				threshold: 10240,
				minRatio: 0.8,
			})
		);
	}

	// currently not using contenthash since we will fetch the generated file with a version anyway
	// ie: https://unpkg.com/polygonjs-engine@1.1.23/dist/polygonjs-engine.js
	common_options.output.chunkFilename = '[name].js'; //'[name].[contenthash].js';
	common_options.output.publicPath = `https://unpkg.com/polygonjs-engine@${POLYGONJS_VERSION}/dist/`; // a default is needed
	if (env.PUBLIC_PATH) {
		common_options.output.publicPath = env.PUBLIC_PATH; // this may be crucial to update depending on the build
	}

	const config = merge(common_options, {
		mode: 'production',
		devtool: 'source-map',
		optimization: {
			chunkIds: 'named',
			// { automaticNameDelimiter?, automaticNameMaxLength?, cacheGroups?, chunks?, enforceSizeThreshold?, fallbackCacheGroup?, filename?, hidePathInfo?, maxAsyncRequests?, maxInitialRequests?, maxSize?, minChunks?, minSize?, name? }
			splitChunks: {
				chunks: 'async', // if chunks is 'all', it seems that the first chunks, like vendors, need to be included manually, which isn't great.
				minSize: 20000,
				// minRemainingSize: 0,
				maxSize: 0,
				minChunks: 1,
				maxAsyncRequests: 30000,
				maxInitialRequests: 30000,
				automaticNameDelimiter: '~',
				enforceSizeThreshold: 50000,
				cacheGroups: {
					mapbox: {
						test: /[\\/].*mapbox.*[\\/]/,
						priority: -10,
						reuseExistingChunk: true,
					},
					regl: {
						test: /[\\/]node_modules[\\/]regl[\\/]/,
						priority: -5,
						reuseExistingChunk: true,
					},
					ammo: {
						test: /[\\/]node_modules[\\/]ammo.*[\\/]/,
						priority: -5,
						reuseExistingChunk: true,
					},
					gsap: {
						test: /[\\/]node_modules[\\/]gsap-core[\\/]/,
						priority: -1,
						reuseExistingChunk: true,
					},
					defaultVendors: {
						test: /[\\/]node_modules[\\/]/,
						priority: -20,
						reuseExistingChunk: true,
					},
					// nodes: {
					// 	test: /[\\/]nodes[\\/]/,
					// 	priority: -10,
					// 	reuseExistingChunk: true,
					// },
					default: {
						minChunks: 2,
						priority: -20,
						reuseExistingChunk: true,
					},
				},
			},

			minimize: MINIFY,
			minimizer: [
				new TerserPlugin({
					extractComments: true,
					parallel: true,
				}),
			],
		},
	});

	// console.log('write debug');
	// const debug_config_path = path.resolve(__dirname, './debug_prod_config.json');
	// fs.writeFileSync(debug_config_path, JSON.stringify(config, null, 4));

	return config;
};