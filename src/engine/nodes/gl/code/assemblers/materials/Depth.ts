// import {UniformsUtils} from 'three';
// import {ShaderMaterial} from 'three';
// import {ShaderLib} from 'three';
// import {RGBADepthPacking} from 'three';
// import {BasicDepthPacking} from 'three';

// import {ShaderAssemblerMaterial} from './_BaseMaterial';
// import {ShaderName} from '../../../../utils/shaders/ShaderName';

// const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
// 	[ShaderName.VERTEX, '#include <begin_vertex>'],
// 	[ShaderName.FRAGMENT, 'vec4 diffuseColor = vec4( 1.0 );'],
// ]);

// export class ShaderAssemblerDepth extends ShaderAssemblerMaterial {
// 	// _color_declaration() { return 'vec4 diffuseColor' }
// 	// _template_shader(){ return ShaderLib.standard }
// 	override templateShader() {
// 		const template = ShaderLib.depth;
// 		return {
// 			vertexShader: template.vertexShader, //TemplateVertex,
// 			fragmentShader: template.fragmentShader, //TemplateFragment,
// 			uniforms: template.uniforms,
// 		};
// 	}
// 	protected override insertBodyAfter(shader_name: ShaderName) {
// 		return INSERT_BODY_AFTER_MAP.get(shader_name);
// 	}

// 	override createMaterial() {
// 		const template_shader = this.templateShader();
// 		return new ShaderMaterial({
// 			// vertexColors: VertexColors,
// 			// side: FrontSide,
// 			// transparent: true,
// 			// fog: true,
// 			// lights: true,
// 			defines: {
// 				DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][1],
// 			},

// 			uniforms: UniformsUtils.clone(template_shader.uniforms),
// 			vertexShader: template_shader.vertexShader,
// 			fragmentShader: template_shader.fragmentShader,
// 		});
// 	}
// }
