const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = (env) => {
	return {
		test: /\.css$/,
		use: [
			{
				loader: MiniCssExtractPlugin.loader,
				options: {hmr: !env.prod},
			},
			'css-loader',
		],
	};
};
