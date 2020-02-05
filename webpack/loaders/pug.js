module.exports = {
	test: /\.pug$/,
	loader: 'pug-plain-loader',
	options: {
		// to include mixins with absolute path instead of relative
		basedir: 'src/editor/pug',
	},
};
