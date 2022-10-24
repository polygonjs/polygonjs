import {BaseShaderAssemblerRayMarchingRendered} from '../../_BaseRayMarchingRendered';
import {UniformsUtils, ShaderMaterial, ShaderLib, FrontSide} from 'three';
import VERTEX from '../../../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../../../gl/raymarching/uniforms';

/**
 * note that when using this custom material,
 * the debugMinDepth and debugMaxDepth properties
 * need to be adjusted by hand.
 */

export class ShaderAssemblerRayMarchingDistance extends BaseShaderAssemblerRayMarchingRendered {
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
			side: FrontSide,
			transparent: false, // important
			depthTest: true,
			alphaTest: 0.5,
			lights: false,
			defines: {
				SHADOW_DISTANCE: 1,
			},
			uniforms: {
				...UniformsUtils.clone(ShaderLib.standard.uniforms),
				...UniformsUtils.clone(templateShader.uniforms),
			},
		});
		// (material as any).isMeshDistanceMaterial = true;

		this._gl_parent_node.scene().sceneTraverser.addLightsRayMarchingUniform(material.uniforms);
		// CoreMaterial.addUserDataRenderHook(material, RayMarchingController.renderHook.bind(RayMarchingController));

		this._addCustomMaterials(material);
		return material;
	}
}
