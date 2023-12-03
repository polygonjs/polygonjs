import Transpiler from 'three/examples/jsm/transpiler/Transpiler';
import GLSLDecoder from '../../modules/three/examples/jsm/transpiler/GLSLDecoder';
import TSLEncoder from '../../modules/three/examples/jsm/transpiler/TSLEncoder';

export function transpileGLSL(glsl: string) {
	const decoder = new GLSLDecoder();
	const encoder = new TSLEncoder();
	(encoder as any).iife = true;
	(encoder as any).uniqueNames = true;
	try {
		const jsCode = new Transpiler(decoder, encoder).parse(glsl);
		return jsCode;
	} catch (err) {
		console.error(err);
	}
}
