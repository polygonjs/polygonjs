import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {BaseCameraObjNode} from '../obj/_BaseCamera';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {ShaderPass} from 'modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {ParamType} from 'src/engine/poly/ParamType';

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniform;
	};
}

// export function ParamF(name: string) {
// 	return function(target: any, propertyKey: string, descriptor: any) {
// 		console.log("A")
// 		// descriptor.get;
// 		return "a"
// 	};
// }

export class Bleach extends BasePostProcessNode {
	@ParamF('opacity') _param_opacity: number;

	static type() {
		return 'bleach';
	}
	static required_three_imports() {
		return ['shaders/BleachBypassShader'];
	}

	private _shader_class: any;
	static async load_js() {
		const {BleachBypassShader} = await CoreScriptLoader.module(this.required_imports()[0]);
		return BleachBypassShader;
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'opacity', 0.95, {range: [-5, 5], range_locked: [true, true]});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
		const pass = new ShaderPass(this._shader_class) as ShaderPassWithRequiredUniforms;
		pass.uniforms['opacity'].value = this._param_opacity;

		composer.addPass(pass);
	}

	async cook() {
		if (!this._shader_class) {
			this._shader_class = await Bleach.load_js();
		}
		this.cook_controller.end_cook();
	}
}
