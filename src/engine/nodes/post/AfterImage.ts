import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';

import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNode} from '../obj/_BaseCamera';
import {ParamType} from 'src/engine/poly/ParamType';

export class AfterImage extends BasePostProcessNode {
	static type() {
		return 'after_image';
	}
	static required_three_imports() {
		return ['postprocessing/AfterimagePass'];
	}

	private _shader_class: any;
	static async load_js() {
		const {AfterimagePass} = await CoreScriptLoader.module(this.required_imports()[0]);
		return AfterimagePass;
	}

	constructor() {
		super();
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'damp', 0.96, {
			range: [0, 1],
			range_locked: [true, true],
		});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
		const pass = new this._shader_class();
		pass.uniforms['damp'].value = this.params.float('damp');
		composer.addPass(pass);
	}

	async cook() {
		if (!this._shader_class) {
			this._shader_class = await AfterImage.load_js();
		}
		this.cook_controller.end_cook();
	}
}
