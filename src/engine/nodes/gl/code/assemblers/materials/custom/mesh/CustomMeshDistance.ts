import {ShaderLib} from 'three';
import {ShaderAssemblerMaterial} from '../../_BaseMaterial';
import {ShaderName} from '../../../../../../utils/shaders/ShaderName';
import TemplateFragment from '../../../../templates/custom/mesh/CustomMeshDistance.frag.glsl';
import {MeshDistanceMaterial} from 'three';
import {includeSSSDeclarations} from '../../common/SSS';
import {AssemblerControllerNode} from '../../../../Controller';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '#include <begin_vertex>'],
	[ShaderName.FRAGMENT, '#include <alphamap_fragment>'],
]);

export class ShaderAssemblerCustomMeshDistance extends ShaderAssemblerMaterial {
	constructor(protected override _gl_parent_node: AssemblerControllerNode) {
		super(_gl_parent_node);

		this._addFilterFragmentShaderCallback('MeshStandardBuilderMatNode', includeSSSDeclarations);
	}
	override templateShader() {
		const template = ShaderLib.distanceRGBA;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: [TemplateFragment, template.fragmentShader][0],
			uniforms: template.uniforms,
		};
	}
	protected override insertBodyAfter(shaderName: ShaderName) {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}

	override createMaterial() {
		return new MeshDistanceMaterial();
	}
}

export class ShaderAssemblerCustomMeshDistanceForRender extends ShaderAssemblerCustomMeshDistance {}
