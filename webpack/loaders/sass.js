module.exports = {
	test: /\.sass?$/,
	use: [
		'vue-style-loader', // creates style nodes from JS strings
		'css-loader', // translates CSS into CommonJS
		{
			loader: 'sass-loader',
			options: {
				implementation: require('sass'),
				sassOptions: {
					indentedSyntax: true,
					includePaths: ['src/editor/sass'],
				},
				// indentedSyntax: true,
				// includePaths: ["app/javascript/sass"],
				// data: `_imports.scss`
			},
		},
	],
};
