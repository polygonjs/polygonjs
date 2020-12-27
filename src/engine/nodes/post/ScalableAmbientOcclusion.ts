// import { Camera } from "three/src/cameras/Camera";
// const THREE = { Camera };
// import { ParamType } from "src/Engine/Param/_Module";

// // import Container from '../../Container/Texture'

// import { BaseNodePostProcess } from "./_Base";
// import { CoreScriptLoader } from "src/Core/Loader/Script";
// import { EffectComposer } from "modules/three/examples/jsm/postprocessing/EffectComposer";
// import { SAOPass } from "modules/three/examples/jsm/postprocessing/SAOPass";
// import { BaseCamera } from "../Obj/_BaseCamera";

// export class ScalableAmbientOcclusion extends BaseNodePostProcess {
// 	static type() {
// 		return "scalable_ambient_occlusion";
// 	}

// 	static async load_js() {
// 		await CoreScriptLoader.load_three_render_pass("SAOPass", {
// 			shaders: [
// 				"SAOShader",
// 				"DepthLimitedBlurShader",
// 				"UnpackDepthRGBAShader"
// 			]
// 		});
// 	}

// 	private _param_output_type: number;

// 	create_params() {
// 		this.self.add_param(ParamType.INTEGER, "output_type", 0, {
// 			menu: {
// 				type: "radio",
// 				entries: [
// 					{ name: "Beauty", value: SAOPass.OUTPUT.Beauty },
// 					{ name: "Beauty+SAO", value: SAOPass.OUTPUT.Default },
// 					{ name: "SAO", value: SAOPass.OUTPUT.SAO },
// 					{ name: "Depth", value: SAOPass.OUTPUT.Depth },
// 					{ name: "Normal", value: SAOPass.OUTPUT.Normal }
// 				]
// 			}
// 		});
// 		this.self.add_param(ParamType.FLOAT, "bias", 0.5, {
// 			range: [-1, 1],
// 			rangeLocked: [true, true]
// 		});
// 		this.self.add_param(ParamType.FLOAT, "intensity", 0.2, {
// 			range: [0, 1],
// 			rangeLocked: [true, true]
// 		});
// 		this.self.add_param(ParamType.FLOAT, "scale", 1, {
// 			range: [0, 10],
// 			rangeLocked: [true, true]
// 		});
// 		this.self.add_param(ParamType.FLOAT, "kernel_radius", 100, {
// 			range: [0, 100],
// 			rangeLocked: [true, true]
// 		});
// 		this.self.add_param(ParamType.FLOAT, "min_resolution", 0, {
// 			range: [0, 1],
// 			rangeLocked: [true, true]
// 		});
// 		this.self.add_param(ParamType.TOGGLE, "blur", 1);
// 		this.self.add_param(ParamType.FLOAT, "blur_radius", 8, {
// 			range: [0, 200],
// 			rangeLocked: [true, true],
// 			visibleIf: { blur: 1 }
// 		});
// 		this.self.add_param(ParamType.FLOAT, "blur_std_dev", 4, {
// 			range: [0.5, 150],
// 			rangeLocked: [true, true],
// 			visibleIf: { blur: 1 }
// 		});
// 		this.self.add_param(ParamType.FLOAT, "blur_deoth_cutoff", 0.01, {
// 			range: [0, 0.1],
// 			rangeLocked: [true, true],
// 			visibleIf: { blur: 1 }
// 		});
// 	}

// 	apply_to_composer(
// 		composer: EffectComposer,
// 		camera: THREE.Camera,
// 		resolution: THREE.Vector2,
// 		camera_node: BaseCamera
// 	) {
// 		const SAOPass_name = "SAOPass";
// 		const pass = new THREE[SAOPass_name](
// 			this._display_scene,
// 			camera,
// 			false,
// 			true
// 		);
// 		pass.params.output = this._param_output_type;
// 		pass.params.saoBias = this._param_bias;
// 		pass.params.saoIntensity = this._param_intensity;
// 		pass.params.saoScale = this._param_scale;
// 		pass.params.saoKernelRadius = this._param_kernel_radius;
// 		pass.params.saoMinResolution = this._param_min_resolution;
// 		pass.params.saoBlur = this._param_blur;
// 		pass.params.saoBlurRadius = this._param_blur_radius;
// 		pass.params.saoBlurStdDev = this._param_blur_std_dev;
// 		pass.params.saoBlurDepthCutoff = this._param_depth_cut_off;

// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		await ScalableAmbientOcclusion.load_js();

// 		this.end_cook();
// 	}
// }
