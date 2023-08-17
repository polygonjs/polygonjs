import {WebGLRenderTarget, MeshBasicMaterial, Texture} from 'three';

export interface BlurMaterial extends MeshBasicMaterial {
	uniforms: {
		previousLightMap: {value: Texture | null};
		pixelOffset: {value: number};
		// polygonOffset: true,
		// polygonOffsetFactor: -1,
		// polygonOffsetUnits: 3.0,
	};
}
export interface BlurMatOptions {
	res: number;
	lightMap: WebGLRenderTarget;
}
export function setBlurMaterial(mat: BlurMaterial, options: BlurMatOptions) {
	mat.uniforms.previousLightMap.value = options.lightMap.texture;
	mat.uniforms.pixelOffset.value = 1.0 / options.res;
}

export function createBlurMaterial() {
	const blurMaterial = new MeshBasicMaterial() as BlurMaterial;
	blurMaterial.uniforms = {
		previousLightMap: {value: null},
		pixelOffset: {value: 1.0},
		// TODO: make sure this is not important
		// polygonOffset: true,
		// polygonOffsetFactor: -1,
		// polygonOffsetUnits: 3.0,
	};
	blurMaterial.polygonOffset = true;
	blurMaterial.polygonOffsetFactor = -1;
	blurMaterial.polygonOffsetUnits = 3.0;

	blurMaterial.onBeforeCompile = (shader) => {
		// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
		shader.vertexShader = `
#define USE_UV
${shader.vertexShader.slice(0, -2)}
	gl_Position = vec4((uv - 0.5) * 2.0, 1.0, 1.0);
}
`;
		const bodyStart = shader.fragmentShader.indexOf('void main() {');
		shader.fragmentShader = `
#define USE_UV
${shader.fragmentShader.slice(0, bodyStart)}
uniform sampler2D previousLightMap;
uniform float pixelOffset;
${shader.fragmentShader.slice(bodyStart - 1, -2)}
	gl_FragColor.rgb = (
		texture2D(previousLightMap, vUv + vec2( pixelOffset,  0.0        )).rgb +
		texture2D(previousLightMap, vUv + vec2( 0.0        ,  pixelOffset)).rgb +
		texture2D(previousLightMap, vUv + vec2( 0.0        , -pixelOffset)).rgb +
		texture2D(previousLightMap, vUv + vec2(-pixelOffset,  0.0        )).rgb +
		texture2D(previousLightMap, vUv + vec2( pixelOffset,  pixelOffset)).rgb +
		texture2D(previousLightMap, vUv + vec2(-pixelOffset,  pixelOffset)).rgb +
		texture2D(previousLightMap, vUv + vec2( pixelOffset, -pixelOffset)).rgb +
		texture2D(previousLightMap, vUv + vec2(-pixelOffset, -pixelOffset)).rgb
	) / 8.0;
}`;

		// Set the LightMap Accumulation Buffer
		// const uniforms = {
		// 	previousShadowMap: {value: lightMap.texture},
		// 	pixelOffset: {value: 0.5 / res},
		// };
		shader.uniforms.previousLightMap = blurMaterial.uniforms.previousLightMap;
		shader.uniforms.pixelOffset = blurMaterial.uniforms.pixelOffset;
		// blurMaterial.uniforms.previousShadowMap = uniforms.previousShadowMap;
		// blurMaterial.uniforms.pixelOffset = uniforms.pixelOffset;

		// Set the new Shader to this
		blurMaterial.userData.shader = shader;
	};
	return blurMaterial;
}
