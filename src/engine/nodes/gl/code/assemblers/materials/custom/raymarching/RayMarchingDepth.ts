import {BaseShaderAssemblerRayMarchingRendered} from '../../_BaseRayMarchingRendered';
// import {CustomMaterialName} from './../../../../../../core/geometry/Material';
// import {CustomAssemblerMap} from './_BaseMaterial';
// import {GlType} from './../../../../../poly/registers/nodes/types/Gl';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib, RGBADepthPacking} from 'three';
// import {BaseShaderAssemblerRayMarchingAbstract} from './_BaseRayMarchingAbstract';
// import {ShaderName} from '../../../../utils/shaders/ShaderName';
// import {OutputGlNode} from '../../../Output';
// import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
// import {CoreMaterial} from '../../../../../../core/geometry/Material';
// import {RayMarchingController} from '../../../../mat/utils/RayMarchingController';
// import {ShaderConfig} from '../../configs/ShaderConfig';
// import {VariableConfig} from '../../configs/VariableConfig';

import VERTEX from '../../../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../../../gl/raymarching/uniforms';
// import {AssemblerControllerNode} from '../../Controller';
// import {ShaderAssemblerRayMarchingApplyMaterial} from './RayMarchingApplyMaterial';

// const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	// [ShaderName.VERTEX, '// start builder body code'],
// 	[ShaderName.FRAGMENT, '// start GetDist builder body code'],
// ]);
// const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([[ShaderName.FRAGMENT, []]]);

// const SDF_CONTEXT_INPUT_NAME = GlConnectionPointType.SDF_CONTEXT;
// const ASSEMBLER_MAP: CustomAssemblerMap = new Map([
// 	// [CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF],
// ]);
// ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth); // for spot lights and directional

export class ShaderAssemblerRayMarchingDepth extends BaseShaderAssemblerRayMarchingRendered {
	override templateShader() {
		return {
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			uniforms: UniformsUtils.clone(RAYMARCHING_UNIFORMS),
		};
	}
	// override customAssemblerClassByCustomName() {
	// 	return ASSEMBLER_MAP;
	// }
	override createMaterial() {
		const templateShader = this.templateShader();
		const material = new ShaderMaterial({
			vertexShader: templateShader.vertexShader,
			fragmentShader: templateShader.fragmentShader,
			side: BackSide,
			transparent: true,
			depthTest: true,
			alphaTest: 0.5,
			lights: false,
			defines: {
				DEBUG_DEPTH: 1,
			},
			uniforms: {
				...UniformsUtils.clone(ShaderLib.standard.uniforms),
				...UniformsUtils.clone(templateShader.uniforms),
			},
		});
		(material as any).depthPacking = RGBADepthPacking;

		this._gl_parent_node.scene().sceneTraverser.addlightsRayMarchingUniform(material.uniforms);
		// CoreMaterial.addUserDataRenderHook(material, RayMarchingController.renderHook.bind(RayMarchingController));

		this._addCustomMaterials(material);
		return material;
	}
}
