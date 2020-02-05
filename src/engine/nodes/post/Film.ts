// import {Vector2} from 'three/src/math/Vector2';
// import {Camera} from 'three/src/cameras/Camera';
// import {BasePostProcessNode} from './_Base';
// import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
// import {BaseCameraObjNode} from '../obj/_BaseCamera';
// import {ParamType} from 'src/engine/poly/ParamType';

// export class Film extends BasePostProcessNode {
// 	static type() {
// 		return 'film';
// 	}
// 	static required_three_imports() {
// 		return ['postprocessing/FilmPass'];
// 	}

// 	private _shader_class: any;
// 	static async load_js() {
// 		// await CoreScriptLoader.load_three_render_pass('FilmPass', {
// 		// 	shaders: ['FilmShader']
// 		// })
// 		const {FilmPass} = await CoreScriptLoader.module(this.required_imports()[0]);
// 		return FilmPass;
// 	}

// 	private _param_noise_intensity: number;
// 	private _param_scanlines_intensity: number;
// 	private _param_scanlines_count: number;
// 	private _param_grayscale: boolean;

// 	create_params() {
// 		this.add_param(ParamType.FLOAT, 'noise_intensity', 0.5, {range: [0, 1], range_locked: [false, false]});
// 		this.add_param(ParamType.FLOAT, 'scanlines_intensity', 0.05, {range: [0, 1], range_locked: [true, false]});
// 		this.add_param(ParamType.INTEGER, 'scanlines_count', 4096, {range: [0, 4096], range_locked: [true, false]});
// 		this.add_param(ParamType.BOOLEAN, 'grayscale', 1);
// 	}

// 	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCameraObjNode) {
// 		// const FilmPass_name = 'FilmPass'
// 		// const pass = new THREE[BloomPass_name](
// 		// 	this._param_strength,
// 		// 	this._param_kernel_size,
// 		// 	this._param_sigma,
// 		// 	256
// 		// )
// 		const pass = new this._shader_class(
// 			this._param_noise_intensity,
// 			this._param_scanlines_intensity,
// 			this._param_scanlines_count,
// 			this._param_grayscale ? 1 : 0
// 		);

// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		if (!this._shader_class) {
// 			this._shader_class = await Film.load_js();
// 		}
// 		this.cook_controller.end_cook();
// 	}
// }
