import {GL_EXTENSIONS} from './Extension';

// https://github.com/mrdoob/three.js/issues/16778
export function GLExtensionSupport(gl: WebGLRenderingContext | WebGL2RenderingContext, extension: string): boolean {
	return gl.getExtension(extension) != null;
}
export function GLUnsupportedExtensions(gl: WebGLRenderingContext | WebGL2RenderingContext): string[] {
	return GL_EXTENSIONS.filter((extension) => !GLExtensionSupport(gl, extension));
}
// export function GLSupportsPostProcessing(gl: WebGLRenderingContext | WebGL2RenderingContext) {
// 	// https://github.com/pmndrs/postprocessing/issues/280
// 	return GLExtensionSupport(gl, 'OES_texture_float_linear');
// }
