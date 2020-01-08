// import { Camera } from "three/src/cameras/Camera";
// const THREE = { Camera };
// import { ParamType } from "src/Engine/Param/_Module";

// // import Container from '../../Container/Texture'

// import { BaseNodePostProcess } from "./_Base";
// import { CoreScriptLoader } from "src/Core/Loader/Script";
// import { EffectComposer } from "modules/three/examples/jsm/postprocessing/EffectComposer";
// import { SSAOPass } from "modules/three/examples/jsm/postprocessing/SSAOPass";
// import { BaseCamera } from "../Obj/_BaseCamera";

// export class ScreenSpaceAmbientOcclusion extends BaseNodePostProcess {
// 	static type() {
// 		return "screen_space_ambient_occlusion";
// 	}

// 	static async load_js() {
// 		await CoreScriptLoader.load_three_render_pass(
// 			"SSAOPass",
// 			{
// 				math: ["SimplexNoise"],
// 				shaders: ["SSAOShader"]
// 			},
// 			{
// 				base_folder: "three_custom"
// 			}
// 		);
// 	}

// 	private _param_output_type: number;
// 	private _param_kernel_radius: number;
// 	private _param_kernel_size: number;
// 	private _param_min_distance: number;
// 	private _param_max_distance: number;

// 	constructor() {
// 		super();
// 	}

// 	create_params() {
// 		this.self.add_param(ParamType.INTEGER, "output_type", 0, {
// 			menu: {
// 				type: "radio",
// 				entries: [
// 					{ name: "Default", value: SSAOPass.OUTPUT.Default },
// 					{ name: "SSAO Only", value: SSAOPass.OUTPUT.SSAO },
// 					{ name: "SSAO Only + Blur", value: SSAOPass.OUTPUT.Blur },
// 					{ name: "Beauty", value: SSAOPass.OUTPUT.Beauty },
// 					{ name: "Depth", value: SSAOPass.OUTPUT.Depth },
// 					{ name: "Normal", value: SSAOPass.OUTPUT.Normal }
// 				]
// 			}
// 		});
// 		this.add_param(ParamType.INTEGER, "kernel_radius", 8, {
// 			range: [0, 32],
// 			range_locked: [true, true]
// 		});
// 		this.add_param(ParamType.INTEGER, "kernel_size", 16, {
// 			range: [0, 32],
// 			range_locked: [true, true]
// 		});
// 		this.add_param(ParamType.FLOAT, "min_distance", 0.005, {
// 			range: [0.001, 0.02],
// 			range_locked: [true, true],
// 			step: 0.001
// 		});
// 		this.add_param(ParamType.FLOAT, "max_distance", 0.1, {
// 			range: [0.01, 0.3],
// 			range_locked: [true, true],
// 			step: 0.001
// 		});
// 	}

// 	apply_to_composer(
// 		composer: EffectComposer,
// 		camera: THREE.Camera,
// 		resolution: THREE.Vector2,
// 		camera_node: BaseCamera
// 	) {
// 		const SSAOPass_name = "SSAOPass";
// 		const pass = new THREE[SSAOPass_name](
// 			this._display_scene,
// 			camera,
// 			resolution.x,
// 			resolution.y
// 		);
// 		pass.output = this._param_output_type;
// 		pass.kernelRadius = this._param_kernel_radius * 0.1; // TODO: this is a hack to debug
// 		pass.kernelSize = this._param_kernel_size;
// 		pass.minDistance = this._param_min_distance;
// 		pass.maxDistance = this._param_max_distance;

// 		composer.passes = [];
// 		composer.addPass(pass);
// 	}

// 	async cook() {
// 		await ScreenSpaceAmbientOcclusion.load_js();
// 		this.end_cook();
// 	}
// }
