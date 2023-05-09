// /**
//  * Allows to compose two different renders.
//  *
//  *
//  */
// import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
// // import {EffectComposer} from '../../../modules/core/post_process/EffectComposer';
// import type {EffectComposer} from 'postprocessing';
// import {WebGLRenderer} from 'three';
// import {WebGLRenderTarget} from 'three';
// import {ShaderMaterial} from 'three';
// import {UniformsUtils} from 'three';
// import {IUniformV2, IUniformN, IUniformTexture} from '../../../engine/nodes/utils/code/gl/Uniforms';
// import VERTEX from './Layer/vert.glsl';
// import FRAGMENT_ADD from './Layer/add.frag.glsl';
// import FRAGMENT_MAX from './Layer/max.frag.glsl';
// import FRAGMENT_MIN from './Layer/min.frag.glsl';
// import FRAGMENT_MULTIPLY from './Layer/multiply.frag.glsl';
// import FRAGMENT_OVER from './Layer/over.frag.glsl';
// import FRAGMENT_SUBTRACT from './Layer/subtract.frag.glsl';

// export enum LayerMode {
// 	ADD = 'add',
// 	MAX = 'max',
// 	MIN = 'min',
// 	MULTIPLY = 'multiply',
// 	OVER = 'over',
// 	SUBTRACT = 'subtract',
// }
// export const LAYER_MODES: LayerMode[] = [
// 	LayerMode.ADD,
// 	LayerMode.MAX,
// 	LayerMode.MIN,
// 	LayerMode.MULTIPLY,
// 	LayerMode.OVER,
// 	LayerMode.SUBTRACT,
// ];

// const FRAGMENT_BY_LAYER_MODE = {
// 	[LayerMode.ADD]: FRAGMENT_ADD,
// 	[LayerMode.MAX]: FRAGMENT_MAX,
// 	[LayerMode.MIN]: FRAGMENT_MIN,
// 	[LayerMode.MULTIPLY]: FRAGMENT_MULTIPLY,
// 	[LayerMode.OVER]: FRAGMENT_OVER,
// 	[LayerMode.SUBTRACT]: FRAGMENT_SUBTRACT,
// };

// interface LayerUniforms {
// 	// tDiffuse: IUniformTexture;
// 	texture1: IUniformTexture;
// 	texture2: IUniformTexture;
// 	delta: IUniformV2;
// 	h: IUniformN;
// }

// // const FRAGMENT = `
// // #include <common>
// // uniform sampler2D tDiffuse;
// // varying vec2 vUv;
// // void main() {
// // 	gl_FragColor = texture2D( tDiffuse, vUv);
// // }`;
// const DEFAULT_LAYER = LAYER_MODES[0];
// const SHADER = {
// 	uniforms: {
// 		tDiffuse: {value: null},
// 		texture1: {value: null},
// 		texture2: {value: null},
// 		h: {value: 1.0 / 512.0},
// 	},
// 	vertexShader: VERTEX,
// 	fragmentShader: FRAGMENT_BY_LAYER_MODE[DEFAULT_LAYER],
// };

// export class LayerPass extends Pass {
// 	public mode: LayerMode = DEFAULT_LAYER;
// 	private material: ShaderMaterial;
// 	private uniforms: LayerUniforms;
// 	private fsQuad: FullScreenQuad;
// 	constructor(private _composer1: EffectComposer, private _composer2: EffectComposer) {
// 		super();

// 		this.uniforms = UniformsUtils.clone(SHADER.uniforms);
// 		this.material = new ShaderMaterial({
// 			uniforms: this.uniforms as any,
// 			vertexShader: SHADER.vertexShader,
// 			fragmentShader: SHADER.fragmentShader,
// 			transparent: false,
// 		});
// 		this.fsQuad = new FullScreenQuad(this.material);
// 	}
// 	override render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget) {
// 		this._composer1.render();
// 		this._composer2.render();

// 		// this.uniforms.texture1.value = this._composer1.writeBuffer.texture;
// 		// this.uniforms.texture2.value = this._composer2.writeBuffer.texture;
// 		this.uniforms.texture1.value = this._composer1.outputBuffer.texture; //.renderTarget2.texture;
// 		this.uniforms.texture2.value = this._composer2.inputBuffer.texture; //.readBuffer.texture;

// 		this._updateMaterialIfRequired();

// 		if (this.renderToScreen) {
// 			renderer.setRenderTarget(null);
// 			this.fsQuad.render(renderer);
// 		} else {
// 			renderer.setRenderTarget(writeBuffer);
// 			if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
// 			this.fsQuad.render(renderer);
// 		}
// 	}
// 	private _materialUpdatedWithMode: LayerMode | undefined;
// 	private _updateMaterialIfRequired() {
// 		if (this._materialUpdatedWithMode == this.mode) {
// 			return;
// 		}
// 		this.material.fragmentShader = FRAGMENT_BY_LAYER_MODE[this.mode];
// 		this.material.needsUpdate = true;

// 		this._materialUpdatedWithMode = this.mode;
// 	}
// }
