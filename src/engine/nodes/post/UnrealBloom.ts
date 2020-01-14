import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';

// import Container from '../../Container/Texture'

import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNode} from '../obj/_BaseCamera';
import {ParamType} from 'src/engine/poly/ParamType';

export class UnrealBloom extends BasePostProcessNode {
	@ParamF('strength') _param_strength: number;
	@ParamF('radius') _param_radius: number;
	@ParamF('threshold') _param_threshold: number;
	static type() {
		return 'unreal_bloom';
	}
	static required_three_imports() {
		return ['postprocessing/UnrealBloomPass'];
	}

	private _shader_class: any;
	static async load_js() {
		// await CoreScriptLoader.load_three_render_pass('UnrealBloomPass', {
		// 	shaders: ['LuminosityHighPassShader']
		// })
		const {UnrealBloomPass} = await CoreScriptLoader.module(this.required_imports()[0]);
		return UnrealBloomPass;
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'strength', 1.5, {range: [0, 3]});
		this.add_param(ParamType.FLOAT, 'radius', 0);
		this.add_param(ParamType.FLOAT, 'threshold', 0);
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
		const pass = new this._shader_class(
			new Vector2(window.innerWidth, window.innerHeight),
			this._param_strength,
			this._param_radius,
			this._param_threshold
		);

		composer.addPass(pass);
	}

	async cook() {
		if (!this._shader_class) {
			this._shader_class = await UnrealBloom.load_js();
		}

		this.cook_controller.end_cook();
	}
}
