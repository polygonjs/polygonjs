import {RGBADepthPacking, BasicDepthPacking} from 'three';
import {ShaderLib} from 'three';
import {ShaderAssemblerMaterial} from '../../_BaseMaterial';
import {ShaderName} from '../../../../../../utils/shaders/ShaderName';
import TemplateFragment from '../../../../templates/custom/mesh/CustomMeshDepth.frag.glsl';
import {MeshDepthMaterial} from 'three';
import {AssemblerControllerNode} from '../../../../Controller';
import {includeSSSDeclarations} from '../../common/SSS';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '#include <begin_vertex>'],
	[ShaderName.FRAGMENT, '#include <alphamap_fragment>'],
]);

export class ShaderAssemblerCustomMeshDepth extends ShaderAssemblerMaterial {
	constructor(protected override _gl_parent_node: AssemblerControllerNode) {
		super(_gl_parent_node);

		this._addFilterFragmentShaderCallback('MeshStandardBuilderMatNode', includeSSSDeclarations);
	}

	override templateShader() {
		const template = ShaderLib.depth;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	protected override insertBodyAfter(shaderName: ShaderName) {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}

	protected depthPacking() {
		// surprisingly, even though the mesh depth material looks better with
		// BasicDepthPacking when used to be rendered,
		// it seems here we need to use RGBADepthPacking
		// to have proper shadows.
		// Also, it is even more surprising as the threejs docs mention
		// from https://threejs.org/docs/?q=mate#api/en/materials/MeshDepthMaterial
		// "Encoding for depth packing. Default is BasicDepthPacking."
		//
		// But the below ShaderAssemblerCustomMeshDepthForRender
		// which is used in MeshDepthBuilder (which is unlike this assembler is not used for shadow, but for direct render)
		// uses BasicDepthPacking
		return RGBADepthPacking;
	}

	override createMaterial() {
		const material = new MeshDepthMaterial({depthPacking: this.depthPacking()});

		return material;
	}
}
export class ShaderAssemblerCustomMeshDepthForRender extends ShaderAssemblerCustomMeshDepth {
	protected override depthPacking() {
		return BasicDepthPacking;
	}
}
