import {RayMarchingUniforms} from './../../../../../nodes/gl/gl/raymarching/uniforms';
import {MaterialWithCustomMaterials} from './../../../../../../core/geometry/Material';
import {BaseShaderAssemblerRayMarchingRendered} from './_BaseRayMarchingRendered';
import {CustomAssemblerMap} from './_BaseMaterial';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib} from 'three';
import VERTEX from '../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../gl/raymarching/uniforms';
import {CustomMaterialName} from '../../../../../../core/geometry/Material';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([]);
// ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerRayMarchingDepth); // for spot lights and directional
// ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerRayMarchingDistance); // for point lights

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
			uniforms: {
				...UniformsUtils.clone(ShaderLib.standard.uniforms),
				...UniformsUtils.clone(templateShader.uniforms),
			},
		});

		this._gl_parent_node.scene().sceneTraverser.addlightsRayMarchingUniform(material.uniforms);

		this._addCustomMaterials(material);

		if ((material as any as MaterialWithCustomMaterials).customMaterials) {
			const customMaterials = (material as any as MaterialWithCustomMaterials).customMaterials;
			const customNames = Object.keys(customMaterials) as CustomMaterialName[];
			for (let customMaterialName of customNames) {
				const customMaterial = customMaterials[customMaterialName];
				if (customMaterial) {
					const uniforms = (customMaterial as ShaderMaterial).uniforms as any as RayMarchingUniforms;
					uniforms.debugMinDepth = material.uniforms.debugMinDepth;
					uniforms.debugMaxDepth = material.uniforms.debugMaxDepth;
				}
			}
		}

		return material;
	}
}
