/**
 * Creates a Raymarching material
 *
 * @remarks
 * This is experimental
 *
 */
// import {ShaderMaterial, BackSide, UniformsUtils} from 'three';
// import {TypedMatNode} from './_Base';

// import VERTEX from '../gl/gl/raymarching/vert.glsl';
// import FRAGMENT from '../gl/gl/raymarching/frag.glsl';
// import {RAYMARCHING_UNIFORMS} from '../gl/gl/raymarching/uniforms';

// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// // import {CoreMaterial} from '../../../core/geometry/Material';
// import {RayMarchingController, RayMarchingParamConfig} from './utils/RayMarchingController';
// class RayMarchingMatParamsConfig extends RayMarchingParamConfig(NodeParamsConfig) {}
// const ParamsConfig = new RayMarchingMatParamsConfig();

// export class RayMarchingMatNode extends TypedMatNode<ShaderMaterial, RayMarchingMatParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'rayMarching';
// 	}

// 	private _rayMarchingController = new RayMarchingController(this);

// 	override createMaterial() {
// 		const mat = new ShaderMaterial({
// 			vertexShader: VERTEX,
// 			fragmentShader: FRAGMENT,
// 			side: BackSide,
// 			transparent: true,
// 			depthTest: true,
// 			alphaTest: 0.5,
// 			uniforms: UniformsUtils.clone(RAYMARCHING_UNIFORMS),
// 		});

// 		// CoreMaterial.addUserDataRenderHook(mat, RayMarchingController.renderHook.bind(RayMarchingController));

// 		return mat;
// 	}

// 	override initializeNode() {}
// 	override async cook() {
// 		this._rayMarchingController.updateUniformsFromParams();

// 		this.setMaterial(this.material);
// 	}
// }
