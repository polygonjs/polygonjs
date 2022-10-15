import {BaseShaderAssemblerRayMarchingRendered} from '../../_BaseRayMarchingRendered';
import {FrontSide, UniformsUtils, ShaderMaterial, ShaderLib, RGBADepthPacking} from 'three';
import VERTEX from '../../../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../../../gl/raymarching/uniforms';

/**
 * note that when using this custom material,
 * the debugMinDepth and debugMaxDepth properties
 * need to be adjusted by hand.
 */

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
			side: FrontSide,
			transparent: false, // important
			depthWrite: true,
			depthTest: true,
			// stencilWrite: false,
			alphaTest: 0.5,
			lights: false,
			defines: {
				SHADOW_DEPTH: 1,
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
