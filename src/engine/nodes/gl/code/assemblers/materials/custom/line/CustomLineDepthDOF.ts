// import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
// import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
// import {RGBADepthPacking} from 'three/src/constants';
// import {BasicDepthPacking} from 'three/src/constants';

// import {ShaderAssemblerMaterial} from '../../_BaseMaterial';

// import TemplateVertex from '../../../../templates/custom/line/CustomLineDepthDOF.vert.glsl';
// import TemplateFragment from '../../../../templates/custom/mesh/CustomMeshDepthDOF.frag.glsl';
// import {ShaderName} from '../../../../../../utils/shaders/ShaderName';
import {ShaderAssemblerCustomLineDepthForRender} from './CustomLineDepth';

// const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([[ShaderName.VERTEX, '// INSERT DEFINES']]);
// const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([[ShaderName.VERTEX, '// INSERT BODY']]);

export const ShaderAssemblerCustomLineDepthDOF = ShaderAssemblerCustomLineDepthForRender;
// export class ShaderAssemblerCustomLineDepthDOF extends ShaderAssemblerMaterial {
// 	// _color_declaration() { return 'vec4 diffuseColor' }
// 	// _template_shader(){ return ShaderLib.standard }
// 	override templateShader() {
// 		return {
// 			vertexShader: TemplateVertex,
// 			fragmentShader: TemplateFragment,
// 			uniforms: {
// 				scale: {value: 1},
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
// 			depthTest: true,
// 			linewidth: 100,

// 			uniforms: UniformsUtils.clone(template_shader.uniforms),
// 			vertexShader: template_shader.vertexShader,
// 			fragmentShader: template_shader.fragmentShader,
// 		});
// 	}
// }
