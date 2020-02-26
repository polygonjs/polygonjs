// import {Vector2} from 'three/src/math/Vector2';
// import {Camera} from 'three/src/cameras/Camera';
// import {BasePostProcessNode} from './_Base';
// import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
// import {BaseCameraObjNode} from '../obj/_BaseCamera';
// import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
// import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
// import {ParamType} from '../../poly/ParamType';

// interface ShaderPassWithRequiredUniforms extends ShaderPass {
// 	uniforms: {
// 		offset: IUniform;
// 		darkness: IUniform;
// 	};
// }

// export class Vignette extends BasePostProcessNode {
// 	@ParamF('offset') _param_offset: number;
// 	@ParamF('darkness') _param_darkness: number;
// 	private _shader_class: any;
// 	static type() {
// 		return 'vignette';
// 	}
// 	static required_three_imports() {
// 		return ['shaders/VignetteShader'];
// 	}

// 	static async load_js() {
// 		const {VignetteShader} = await CoreScriptLoader.module(this.required_imports()[0]);
// 		return VignetteShader;
// 	}

// 	create_params() {
// 		this.add_param(ParamType.FLOAT, 'offset', 1, {range: [0, 1], range_locked: [false, false]});
// 		this.add_param(ParamType.FLOAT, 'darkness', 1, {range: [0, 2], range_locked: [true, false]});
// 	}

// 	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
// 		const pass = new ShaderPass(this._shader_class) as ShaderPassWithRequiredUniforms;
// 		pass.uniforms['offset'].value = this._param_offset;
// 		pass.uniforms['darkness'].value = this._param_darkness;

// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		if (!this._shader_class) {
// 			this._shader_class = await Vignette.load_js();
// 		}
// 		this.cook_controller.end_cook();
// 	}
// }
