// import {Vector2} from 'three/src/math/Vector2';
// import {Camera} from 'three/src/cameras/Camera';
// import {BasePostProcessNode} from './_Base';
// import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
// import {BaseCameraObjNode} from '../obj/_BaseCamera';
// import {ParamType} from 'src/engine/poly/ParamType';

// export class Glitch extends BasePostProcessNode {
// 	static type() {
// 		return 'glitch';
// 	}
// 	static required_three_imports() {
// 		return ['postprocessing/GlitchPass'];
// 	}

// 	private _shader_class: any;
// 	static async load_js() {
// 		// await CoreScriptLoader.load_three_render_pass('GlitchPass', {
// 		// 	shaders: ['DigitalGlitch']
// 		// })
// 		const {GlitchPass} = await CoreScriptLoader.module(this.required_imports()[0]);
// 		return GlitchPass;
// 	}

// 	private _param_go_wild: boolean;

// 	create_params() {
// 		this.add_param(ParamType.BOOLEAN, 'go_wild', 0);
// 	}

// 	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
// 		const pass = new this._shader_class();
// 		pass.goWild = this._param_go_wild;

// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		if (!this._shader_class) {
// 			this._shader_class = await Glitch.load_js();
// 		}
// 		this.cook_controller.end_cook();
// 	}
// }
