import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';
import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCamera} from '../obj/_BaseCamera';

export class DotScreen extends BasePostProcessNode {
	@ParamV2('center') _param_center: Vector2;
	@ParamF('angle') _param_angle: number;
	@ParamF('scale') _param_scale: number;
	static type() {
		return 'dot_screen';
	}
	static required_three_imports() {
		return ['postprocessing/DotScreenPass'];
	}

	private _shader_class: any;
	static async load_js() {
		// await CoreScriptLoader.load_three_render_pass('DotScreenPass', {
		// 	shaders: ['DotScreenShader']
		// })
		const {DotScreenPass} = await CoreScriptLoader.module(this.required_imports()[0]);
		return DotScreenPass;
	}

	constructor() {
		super();
	}

	create_params() {
		this.add_param(ParamType.VECTOR2, 'center', [0.5, 0.5]);
		this.add_param(ParamType.FLOAT, 'angle', 1.57, {range: [0, 10], range_locked: [false, false]});
		this.add_param(ParamType.FLOAT, 'scale', 1.0, {range: [0, 1], range_locked: [false, false]});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCamera) {
		// const pass = new THREE[BloomPass_name](
		// 	this._param_strength,
		// 	this._param_kernel_size,
		// 	this._param_sigma,
		// 	256
		// )
		const pass = new this._shader_class(
			this._param_center || new Vector2(0, 0),
			this._param_angle || 1,
			this._param_scale || 1
		);

		composer.addPass(pass);
	}

	async cook() {
		if (!this._shader_class) {
			this._shader_class = await DotScreen.load_js();
		}
		this.cook_controller.end_cook();
	}
}
