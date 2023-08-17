import {MeshPhongMaterial, WebGLRenderTarget, Texture} from 'three';
export const UV_LIGHT_MAP_FLIPPED_ATTRIB_NAME = 'uvLightmapFlipped';

export interface LightMapMaterial extends MeshPhongMaterial {
	uniforms: {
		previousLightMap: {value: Texture | null};
		lightMapMult: {value: number};
		// flipped: {value: boolean};
	};
}
export interface LightMapMatOptions {
	lightMap: WebGLRenderTarget;
	// lightMapMult: number;
}
export function setLightMapMaterial(mat: LightMapMaterial, options: LightMapMatOptions) {
	mat.uniforms.previousLightMap.value = options.lightMap.texture;
	// mat.uniforms.lightMapMult.value = options.lightMapMult;
}

export function createLightMapMaterial() {
	const mat = new MeshPhongMaterial() as LightMapMaterial;
	mat.uniforms = {
		previousLightMap: {value: null},
		// iterationBlend: {value: DEFAULT_ITERATION_BLEND},
		lightMapMult: {value: 1},
		// flipped: {value: false},
	};
	// mat.transparent = true;
	// mat.blending = AdditiveBlending;
	// mat.alphaTest = 0.5;
	mat.name = 'lightMapMaterial';
	mat.onBeforeCompile = (shader) => {
		// Vertex Shader: Set Vertex Positions to the Unwrapped UV Positions
		shader.vertexShader = `#define USE_LIGHTMAP
#define LIGHTMAP_UV uvLightMap
attribute vec2 uvLightMap;
// attribute float ${UV_LIGHT_MAP_FLIPPED_ATTRIB_NAME};
varying vec2 vUvLightMap;
// varying float vUvLightMapFlipped;
${shader.vertexShader.slice(0, -2)}
	vUvLightMap = LIGHTMAP_UV;
	// vUvLightMapFlipped = ${UV_LIGHT_MAP_FLIPPED_ATTRIB_NAME};
	gl_Position = vec4((LIGHTMAP_UV - 0.5) * 2.0, 1.0, 1.0);
}`;

		// Fragment Shader: Set Pixels to average in the Previous frame's Shadows
		const bodyStart = shader.fragmentShader.indexOf('void main() {');
		shader.fragmentShader = `#define USE_LIGHTMAP
varying vec2 vUvLightMap;
// varying float vUvLightMapFlipped;
${shader.fragmentShader.slice(0, bodyStart)}
uniform sampler2D previousLightMap;
// uniform float iterationBlend;
uniform float lightMapMult;
// uniform bool flipped;
${shader.fragmentShader.slice(bodyStart - 1, -2)}
	vec3 texelOld = texture2D(previousLightMap, vUvLightMap).rgb;
	// gl_FragColor.rgb = gl_FragColor.rgb + texelOld / totalIterationsCount;
	// gl_FragColor.a = flipped ? vUvLightMapFlipped : 1.-vUvLightMapFlipped;
	gl_FragColor.rgb = texelOld + gl_FragColor.rgb * lightMapMult;// * gl_FragColor.a;
	// gl_FragColor.a = lightMapMult;
	// gl_FragColor.rgb = mix(texelOld, gl_FragColor.rgb, iterationBlend);
	// gl_FragColor.rgb = vec3(vUvLightMap);
}
`;

		// Set the Previous Frame's Texture Buffer and Averaging Window
		// const uniforms = {
		// 	previousShadowMap: {value: renderTarget.texture}, //this.progressiveLightMap1.texture},
		// 	iterationBlend: {value: DEFAULT_ITERATION_BLEND},
		// };
		shader.uniforms.previousLightMap = mat.uniforms.previousLightMap; //{value: renderTarget.texture}; //uniforms.previousShadowMap;
		shader.uniforms.lightMapMult = mat.uniforms.lightMapMult; //{value: 0};
		// shader.uniforms.flipped = mat.uniforms.flipped;
		// shader.uniforms.iterationBlend = uniforms.iterationBlend;
		// mat.uniforms = shader.uniforms as any;
		// mat.uniforms.previousShadowMap = uniforms.previousShadowMap;
		// mat.uniforms.iterationBlend = uniforms.iterationBlend;

		// Set the new Shader to this
		mat.userData.shader = shader;
	};
	return mat;
}
