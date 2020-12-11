module.exports = (env, transpile_only) => {
	return {
		test: /\.ts?$/,
		exclude: /node_modules/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					transpileOnly: transpile_only,
					// experimentalWatchApi: true, // This seems to cause crashes when using many files
				},
			},
		],
	};
};
