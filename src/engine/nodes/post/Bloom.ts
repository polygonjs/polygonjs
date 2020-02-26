// import {Camera} from 'three/src/cameras/Camera';
// import {Vector2} from 'three/src/math/Vector2';
// import {BasePostProcessNode} from './_Base';
// import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
// import {BaseCameraObjNode} from '../obj/_BaseCamera';
// import {ParamType} from '../../poly/ParamType';

// export class Bloom extends BasePostProcessNode {
// 	@ParamF('strength') _param_strength: number;
// 	@ParamF('kernel_size') _param_kernel_size: number;
// 	@ParamF('sigma') _param_sigma: number;

// 	static type() {
// 		return 'bloom';
// 	}
// 	static required_three_imports() {
// 		return ['postprocessing/BloomPass'];
// 	}

// 	private _shader_class: any;
// 	static async load_js() {
// 		// await CoreScriptLoader.load_three_render_pass('BloomPass', {
// 		// 	shaders: ['ConvolutionShader']
// 		// })
// 		const {BloomPass} = await CoreScriptLoader.module(this.required_imports()[0]);
// 		return BloomPass;
// 	}

// 	create_params() {
// 		this.add_param(ParamType.FLOAT, 'strength', 0.5, {range: [0, 1], range_locked: [false, false]});
// 		this.add_param(ParamType.INTEGER, 'kernel_size', 25, {range: [0, 100], range_locked: [true, false]});
// 		this.add_param(ParamType.FLOAT, 'sigma', 4.0, {range: [-100, 100], range_locked: [false, false]});
// 	}

// 	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
// 		const pass = new this._shader_class(this._param_strength);

// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		if (!this._shader_class) {
// 			this._shader_class = await Bloom.load_js();
// 		}
// 		this.cook_controller.end_cook();
// 	}
// }
