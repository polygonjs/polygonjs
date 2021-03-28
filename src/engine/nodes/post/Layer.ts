/**
 * Allows to compose two different renders.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EffectComposer} from '../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {LinearFilter, RGBAFormat} from 'three/src/constants';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {IUniformV2, IUniformN, IUniformTexture} from '../utils/code/gl/Uniforms';
import VERTEX from './gl/default.vert.glsl';
import FRAGMENT from './gl/Layer.frag.glsl';
import {Poly} from '../../Poly';

interface LayerUniforms {
	// tDiffuse: IUniformTexture;
	texture1: IUniformTexture;
	texture2: IUniformTexture;
	delta: IUniformV2;
	h: IUniformN;
}

// const FRAGMENT = `
// #include <common>
// uniform sampler2D tDiffuse;
// varying vec2 vUv;
// void main() {
// 	gl_FragColor = texture2D( tDiffuse, vUv);
// }`;
const SHADER = {
	uniforms: {
		tDiffuse: {value: null},
		texture1: {value: null},
		texture2: {value: null},
		h: {value: 1.0 / 512.0},
	},
	vertexShader: VERTEX,
	fragmentShader: FRAGMENT,
};

class LayerPass extends Pass {
	private material: ShaderMaterial;
	private uniforms: LayerUniforms;
	private fsQuad: Pass.FullScreenQuad;
	constructor(private _composer1: EffectComposer, private _composer2: EffectComposer) {
		super();

		this.uniforms = UniformsUtils.clone(SHADER.uniforms);
		this.material = new ShaderMaterial({
			uniforms: this.uniforms as any,
			vertexShader: SHADER.vertexShader,
			fragmentShader: SHADER.fragmentShader,
			transparent: true,
		});
		this.fsQuad = new Pass.FullScreenQuad(this.material);
	}
	render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget) {
		this._composer1.render();
		this._composer2.render();

		// this.uniforms.texture1.value = this._composer1.writeBuffer.texture;
		// this.uniforms.texture2.value = this._composer2.writeBuffer.texture;
		this.uniforms.texture1.value = this._composer1.readBuffer.texture;
		this.uniforms.texture2.value = this._composer2.readBuffer.texture;

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
			this.fsQuad.render(renderer);
		}
	}
}

class LayerPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new LayerPostParamsConfig();
export class LayerPostNode extends TypedPostProcessNode<LayerPass, LayerPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'layer';
	}

	initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(2);
	}

	setup_composer(context: TypedPostNodeContext): void {
		const renderer = context.composer.renderer;

		const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: true,
		};
		const render_target1 = Poly.renderersController.renderTarget(
			renderer.domElement.offsetWidth,
			renderer.domElement.offsetHeight,
			parameters
		);
		const render_target2 = Poly.renderersController.renderTarget(
			renderer.domElement.offsetWidth,
			renderer.domElement.offsetHeight,
			parameters
		);
		const composer1 = new EffectComposer(renderer, render_target1);
		const composer2 = new EffectComposer(renderer, render_target2);
		// renderToScreen = false to ensure the last pass of each composer is still
		// written to the render_target
		composer1.renderToScreen = false;
		composer2.renderToScreen = false;

		const cloned_context1 = {...context};
		const cloned_context2 = {...context};
		cloned_context1.composer = composer1;
		cloned_context2.composer = composer2;
		this._add_pass_from_input(0, cloned_context1);
		this._add_pass_from_input(1, cloned_context2);

		const pass = new LayerPass(composer1, composer2);
		this.update_pass(pass);
		context.composer.addPass(pass);
	}

	update_pass(pass: LayerPass) {}
}
