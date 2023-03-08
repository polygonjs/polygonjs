// https://github.com/donalffons/opencascade.js/issues/150
// https://github.com/donalffons/opencascade.js/issues/81

module.exports = {
	test: /\.wasm$/,
	type: 'javascript/auto',
	use: [
		{
			loader: 'file-loader',
			options: {
				name: '[path][name].[md5:hash:base64:6].[ext]',
			},
		},
	],
};
