// this loader is not required, as is replaced by custom_typings/glsl.d.ts
// (from: https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript)
// Although that may not work from .js files, only from .ts
module.exports = {
	test: /\.glsl$/,
	use: [{loader: 'ts-shader-loader'}],
};
