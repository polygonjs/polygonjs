module.exports = (transpile_only) => {
	return {
		test: /\.ts?$/,
		exclude: /node_modules/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					transpileOnly: transpile_only,
					experimentalWatchApi: true,
				},
			},
		],
	};
};
