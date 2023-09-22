import {RayMarchingUniforms} from './../../../../../nodes/gl/gl/raymarching/uniforms';
import {MaterialWithCustomMaterials} from './../../../../../../core/geometry/Material';
import {BaseShaderAssemblerRayMarchingRendered} from './_BaseRayMarchingRendered';
import {CustomAssemblerMap} from './_BaseMaterial';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib} from 'three';
import VERTEX from '../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../gl/raymarching/uniforms';
import {CustomMaterialName} from '../../../../../../core/geometry/Material';
import {ShaderAssemblerRayMarchingDepth} from './custom/raymarching/RayMarchingDepth';
import {ShaderAssemblerRayMarchingDistance} from './custom/raymarching/RayMarchingDistance';
// import {ThreeToGl} from '../../../../../../core/ThreeToGl';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([]);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerRayMarchingDepth); // for spot lights and directional
ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerRayMarchingDistance); // for point lights

export class ShaderAssemblerRayMarching extends BaseShaderAssemblerRayMarchingRendered {
	override templateShader() {
		return {
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			uniforms: UniformsUtils.clone(RAYMARCHING_UNIFORMS),
		};
	}
	override customAssemblerClassByCustomName() {
		return ASSEMBLER_MAP;
	}
	override createMaterial() {
		const templateShader = this.templateShader();
		const material = new ShaderMaterial({
			vertexShader: templateShader.vertexShader,
			fragmentShader: templateShader.fragmentShader,
			side: BackSide,
			transparent: true,
			depthTest: true,
			alphaTest: 0.5,
			lights: true,
			// defines: {
			// 	ENVMAP_TYPE_CUBE_UV: 0,
			// 	CUBEUV_TEXEL_WIDTH: ThreeToGl.float(0.1),
			// 	CUBEUV_TEXEL_HEIGHT: ThreeToGl.float(0.1),
			// 	CUBEUV_MAX_MIP: ThreeToGl.float(0),
			// },
			uniforms: {
				...UniformsUtils.clone(ShaderLib.standard.uniforms),
				...UniformsUtils.clone(templateShader.uniforms),
			},
		});

		this._gl_parent_node.scene().sceneTraverser.addLightsRayMarchingUniform(material.uniforms);

		this._addCustomMaterials(material);

		if ((material as any as MaterialWithCustomMaterials).customMaterials) {
			const materialUniforms = material.uniforms as any as RayMarchingUniforms;
			const customMaterials = (material as any as MaterialWithCustomMaterials).customMaterials;
			const customNames = Object.keys(customMaterials) as CustomMaterialName[];
			for (const customMaterialName of customNames) {
				const customMaterial = customMaterials[customMaterialName];
				if (customMaterial) {
					const uniforms = (customMaterial as ShaderMaterial).uniforms as any as RayMarchingUniforms;
					uniforms.shadowDistanceMin = materialUniforms.shadowDistanceMin;
					uniforms.shadowDistanceMax = materialUniforms.shadowDistanceMax;
					uniforms.shadowDepthMin = materialUniforms.shadowDepthMin;
					uniforms.shadowDepthMax = materialUniforms.shadowDepthMax;
				}
			}
		}

		return material;
	}
}
