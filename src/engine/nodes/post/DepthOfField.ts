import {Vector2} from 'three/src/math/Vector2';
// import {OrthoOrPerspCamera} from 'src/engine/nodes/obj/_BaseCamera';

import {BasePostProcessNode} from './_Base';
import {BaseCameraObjNode} from '../obj/_BaseCamera';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {CoreScriptLoader} from 'src/core/loader/Script';
import {PerspectiveCamera} from 'three';

export class DepthOfField extends BasePostProcessNode {
	@ParamF('strength') _param_focal_depth: number;
	@ParamF('f_stop') _param_f_stop: number;
	@ParamF('max_blur') _param_max_blur: number;
	@ParamF('vignetting') _param_vignetting: boolean;
	@ParamF('depth_blur') _param_depth_blur: boolean;
	@ParamF('threshold') _param_threshold: number;
	@ParamF('gain') _param_gain: number;
	@ParamF('bias') _param_bias: number;
	@ParamF('fringe') _param_fringe: number;
	@ParamF('noise') _param_noise: number;
	@ParamF('dithering') _param_dithering: number;
	@ParamF('pentagon') _param_pentagon: number;
	@ParamF('rings') _param_rings: number;
	@ParamF('samples') _param_samples: number;
	private _pass: any;

	static type() {
		return 'depth_of_field';
	}
	static required_imports() {
		return ['Core/PostProcess/BokehPass2'];
	}

	static async load_js() {
		// const {BokehPass2} = await import('src/Core/PostProcess/BokehPass2')
		const {BokehPass2} = await CoreScriptLoader.module(DepthOfField.required_imports()[0]);
		return BokehPass2;
	}

	constructor() {
		super();
	}

	static saturate(x: number) {
		return Math.max(0, Math.min(1, x));
	}

	static linearize(depth: number, near: number, far: number) {
		var zfar = far;
		var znear = near;
		return (-zfar * znear) / (depth * (zfar - znear) - zfar);
	}

	static smoothstep(near: number, far: number, depth: number) {
		var x = this.saturate((depth - near) / (far - near));
		return x * x * (3 - 2 * x);
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'focal_depth', 10, {range: [0, 200], range_locked: [true, false]});
		this.add_param(ParamType.FLOAT, 'f_stop', 10, {range: [0.1, 22], range_locked: [true, true]});
		this.add_param(ParamType.FLOAT, 'max_blur', 10, {range: [0, 10], range_locked: [true, false]});
		this.add_param(ParamType.BOOLEAN, 'vignetting', 0);
		this.add_param(ParamType.BOOLEAN, 'depth_blur', 0);

		this.add_param(ParamType.FLOAT, 'threshold', 0.5, {range: [0, 1], range_locked: [true, true], step: 0.001});
		this.add_param(ParamType.FLOAT, 'gain', 1, {range: [0, 100], range_locked: [true, true], step: 0.001});
		this.add_param(ParamType.FLOAT, 'bias', 0.5, {range: [0, 3], range_locked: [true, true], step: 0.001});
		this.add_param(ParamType.FLOAT, 'fringe', 0.7, {range: [0, 5], range_locked: [true, false], step: 0.001});

		this.add_param(ParamType.BOOLEAN, 'noise', 0);
		this.add_param(ParamType.FLOAT, 'dithering', 0, {range: [0, 0.001], range_locked: [true, true], step: 0.0001});

		this.add_param(ParamType.BOOLEAN, 'pentagon', 0);
		this.add_param(ParamType.INTEGER, 'rings', 3, {range: [1, 8], range_locked: [true, true]});
		this.add_param(ParamType.INTEGER, 'samples', 4, {range: [1, 13], range_locked: [true, true]});
	}

	apply_to_composer(
		composer: EffectComposer,
		camera: PerspectiveCamera,
		resolution: Vector2,
		camera_node: BaseCameraObjNode
	) {
		const pass = new this._pass(this._display_scene, camera, [resolution.x, resolution.y], camera_node);

		pass.processing.bokeh_uniforms['fstop'].value = this._param_f_stop;
		pass.processing.bokeh_uniforms['maxblur'].value = this._param_max_blur;

		pass.processing.bokeh_uniforms['threshold'].value = this._param_threshold;
		pass.processing.bokeh_uniforms['gain'].value = this._param_gain;
		pass.processing.bokeh_uniforms['bias'].value = this._param_bias;
		pass.processing.bokeh_uniforms['fringe'].value = this._param_fringe;
		pass.processing.bokeh_uniforms['dithering'].value = this._param_dithering;

		// from camera
		pass.processing.bokeh_uniforms['focalLength'].value = camera.getFocalLength();
		pass.processing.bokeh_uniforms['znear'].value = camera.near;
		pass.processing.bokeh_uniforms['zfar'].value = camera.far;

		// focal length
		var sdistance = DepthOfField.smoothstep(camera.near, camera.far, this._param_focal_depth);
		var ldistance = DepthOfField.linearize(1 - sdistance, camera.near, camera.far);
		pass.processing.bokeh_uniforms['focalDepth'].value = ldistance; //this._param_focal_depth

		// booleans
		pass.processing.bokeh_uniforms['noise'].value = this._param_noise ? 1 : 0;
		pass.processing.bokeh_uniforms['pentagon'].value = this._param_pentagon ? 1 : 0;
		pass.processing.bokeh_uniforms['vignetting'].value = this._param_vignetting ? 1 : 0;
		pass.processing.bokeh_uniforms['depthblur'].value = this._param_depth_blur ? 1 : 0;

		// debug
		pass.processing.bokeh_uniforms['shaderFocus'].value = 0;
		pass.processing.bokeh_uniforms['showFocus'].value = 0;
		pass.processing.bokeh_uniforms['manualdof'].value = 0;
		pass.processing.bokeh_uniforms['focusCoords'].value.set(0.5, 0.5);

		pass.processing.materialBokeh.defines['RINGS'] = this._param_rings;
		pass.processing.materialBokeh.defines['SAMPLES'] = this._param_samples;
		pass.processing.materialBokeh.needsUpdate = true;

		composer.passes = [];
		composer.addPass(pass);
	}

	async cook() {
		if (!this._pass) {
			this._pass = await DepthOfField.load_js();
		}
		this.cook_controller.end_cook();
	}
}
