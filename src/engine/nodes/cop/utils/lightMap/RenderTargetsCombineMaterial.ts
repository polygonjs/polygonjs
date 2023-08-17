import {ShaderMaterial, WebGLRenderTarget, Texture} from 'three';
export const UV_LIGHT_MAP_FLIPPED_ATTRIB_NAME = 'uvLightmapFlipped';

export interface RenderTargetsCombineMaterial extends ShaderMaterial {
	uniforms: {
		rt1: {value: Texture | null};
		rt2: {value: Texture | null};
	};
}
export interface RenderTargetsCombineMatOptions {
	rt1: WebGLRenderTarget;
	rt2: WebGLRenderTarget;
}
export function setRenderTargetsCombineMaterial(
	mat: RenderTargetsCombineMaterial,
	options: RenderTargetsCombineMatOptions
) {
	mat.uniforms.rt1.value = options.rt1.texture;
	mat.uniforms.rt2.value = options.rt2.texture;
}

export function createRenderTargetsCombineMaterial() {
	const mat = new ShaderMaterial() as RenderTargetsCombineMaterial;
	mat.uniforms = {
		rt1: {value: null},
		rt2: {value: null},
	};
	mat.name = 'renderTargetsCombineMaterial';
	mat.onBeforeCompile = (shader) => {
		shader.vertexShader = `
varying vec2 vUv;
void main(){
	vUv = uv;
	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0);
}`;

		// const bodyStart = shader.fragmentShader.indexOf('void main() {');
		shader.fragmentShader = `
uniform sampler2D rt1;
uniform sampler2D rt2;
varying vec2 vUv;
void main(){
	vec3 rt1Value = texture2D(rt1, vUv).rgb;
	vec3 rt2Value = texture2D(rt2, vUv).rgb;
	gl_FragColor.rgb = rt1Value + rt2Value;
}
`;

		shader.uniforms.rt1 = mat.uniforms.rt1;
		shader.uniforms.rt2 = mat.uniforms.rt2;

		// Set the new Shader to this
		mat.userData.shader = shader;
	};
	return mat;
}
