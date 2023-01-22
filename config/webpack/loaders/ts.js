// module.exports = (transpile_only) => {
// 	return {
// 		test: /\.ts?$/,
// 		exclude: /node_modules/,
// 		use: [
// 			{
// 				loader: 'ts-loader',
// 				options: {
// 					transpileOnly: transpile_only,
// 					// experimentalWatchApi: true, // This seems to cause crashes when using many files
// 					// loader: 'ts',
// 					// target: 'es2016',
// 				},
// 			},
// 		],
// 	};
// };

module.exports = () => {
	return {
		test: /\.ts?$/,
		exclude: /node_modules/,
		use: [
			{
				loader: 'esbuild-loader',
				options: {
					// transpileOnly: transpile_only,
					// experimentalWatchApi: true, // This seems to cause crashes when using many files
					loader: 'ts',
					target: 'es2016',
				},
			},
		],
	};
};
