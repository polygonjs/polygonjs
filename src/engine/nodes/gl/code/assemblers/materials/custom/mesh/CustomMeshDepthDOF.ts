// import {UniformsUtils} from 'three';
// import {ShaderMaterial} from 'three';
// import {ShaderLib} from 'three';
// import {RGBADepthPacking} from 'three';
// import {BasicDepthPacking} from 'three';

// import {ShaderAssemblerMaterial} from '../../_BaseMaterial';

// import TemplateVertex from '../../../../templates/custom/mesh/CustomMeshDepthDOF.vert.glsl';
// import TemplateFragment from '../../../../templates/custom/mesh/CustomMeshDepthDOF.frag.glsl';
// import {ShaderName} from '../../../../../../utils/shaders/ShaderName';
import {ShaderAssemblerCustomMeshDepthForRender} from './CustomMeshDepth';

// const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	[ShaderName.VERTEX, '// INSERT DEFINES'],
// 	[ShaderName.FRAGMENT, '// INSERT DEFINES'],
// ]);
// const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	[ShaderName.VERTEX, '// INSERT BODY'],
// 	[ShaderName.FRAGMENT, '// INSERT BODY'],
// ]);

export const ShaderAssemblerCustomMeshDepthDOF = ShaderAssemblerCustomMeshDepthForRender;
// export class ShaderAssemblerCustomMeshDepthDOF extends ShaderAssemblerMaterial {
// 	// _color_declaration() { return 'vec4 diffuseColor' }
// 	// _template_shader(){ return ShaderLib.standard }
// 	override templateShader() {
// 		return {
// 			vertexShader: TemplateVertex,
// 			fragmentShader: TemplateFragment,
// 			uniforms: {
// 				mNear: {value: 0},
// 				mFar: {value: 10},
// 			},
// 		};
// 	}
// 	protected override insertDefineAfter(shader_name: ShaderName) {
// 		return INSERT_DEFINE_AFTER_MAP.get(shader_name);
// 	}
// 	protected override insertBodyAfter(shader_name: ShaderName) {
// 		return INSERT_BODY_AFTER_MAP.get(shader_name);
// 	}

// 	override createMaterial() {
// 		const template_shader = this.templateShader();
// 		return new ShaderMaterial({
// 			// defines: {
// 			// 	DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0]
// 			// },
// 			transparent: true,

// 			uniforms: UniformsUtils.clone(template_shader.uniforms),
// 			vertexShader: template_shader.vertexShader,
// 			fragmentShader: template_shader.fragmentShader,
// 		});
// 	}
// }
