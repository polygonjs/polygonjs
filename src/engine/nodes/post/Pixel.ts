import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';

// import Container from '../../Container/Texture'

import {BasePostProcessNode} from './_Base';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNode} from '../obj/_BaseCamera';
import {ShaderPass} from 'modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {ParamType} from 'src/engine/poly/ParamType';

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		resolution: IUniform;
		pixelSize: IUniform;
	};
}

export class Pixel extends BasePostProcessNode {
	static type() {
		return 'pixel';
	}
	static required_three_imports() {
		return ['shaders/PixelShader'];
	}

	private _shader_class: any;

	static async load_js() {
		// await CoreScriptLoader.load_three_render_pass_requirement()
		const {PixelShader} = await CoreScriptLoader.module(this.required_imports()[0]);
		return PixelShader;
	}

	private _param_pixel_size: number;

	constructor() {
		super();
	}

	create_params() {
		this.add_param(ParamType.INTEGER, 'pixel_size', 16, {
			range: [1, 50],
			range_locked: [true, false],
		});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
		const pass = new ShaderPass(this._shader_class) as ShaderPassWithRequiredUniforms;
		pass.uniforms['resolution'].value = resolution;
		pass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
		pass.uniforms['pixelSize'].value = this._param_pixel_size;

		composer.addPass(pass);
	}
	async cook() {
		if (!this._shader_class) {
			this._shader_class = await Pixel.load_js();
		}

		// const PixelShader_name = 'PixelShader'
		// const ShaderPass_name = 'ShaderPass'
		// const pass = new THREE[ShaderPass_name]( THREE[PixelShader_name] );
		// pass.uniforms["resolution"].value = new Vector2( window.innerWidth, window.innerHeight )
		// pass.uniforms["resolution"].value.multiplyScalar( window.devicePixelRatio )
		// pass.uniforms["pixelSize"].value = this._param_pixel_size

		// this.set_render_pass(pass)
		this.cook_controller.end_cook();
	}
}
