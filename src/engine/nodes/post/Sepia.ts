import {Camera} from 'three/src/cameras/Camera';
import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCamera} from '../obj/_BaseCamera';
import {ShaderPass} from 'modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		amount: IUniform;
	};
}

export class Sepia extends BasePostProcessNode {
	static type() {
		return 'sepia';
	}
	static required_three_imports() {
		return ['shaders/SepiaShader'];
	}

	static async load_js() {
		const {SepiaShader} = await CoreScriptLoader.module(this.required_imports()[0]);
		return SepiaShader;
	}
	private _shader_class: any;
	private _param_amount: number;

	constructor() {
		super();
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'amount', 0.5, {range: [0, 1], range_locked: [false, false]});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCamera) {
		const pass = new ShaderPass(this._shader_class) as ShaderPassWithRequiredUniforms;
		pass.uniforms['amount'].value = this._param_amount;

		composer.addPass(pass);
	}

	async cook() {
		if (!this._shader_class) {
			this._shader_class = await Sepia.load_js();
		}
		this.cook_controller.end_cook();
	}
}
