import {TypedGlNode} from './_Base';
// import {ParamType} from '../../../Engine/Param/_Module';
// import {Connection} from './GlData';
// import {Definition} from './Definition/_Module';
// import {ShaderName} from './Assembler/Util/CodeBuilder';

// list of globals
// https://www.khronos.org/opengl/wiki/Built-in_Variable_(GLSL)
// gl_PointCoord

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class GlobalsGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsGlParamsConfig();

export class GlobalsGlNode extends TypedGlNode<GlobalsGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'globals';
	}

	initialize_node() {
		super.initialize_node();
		this.lifecycle.add_on_add_hook(() => {
			this.material_node?.assembler_controller.add_globals_params(this);
		});
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// if (lines_controller.shader_name) {
		this.material_node?.assembler_controller?.assembler.set_node_lines_globals(this, shaders_collection_controller);
		// }
		// const vertex_definitions = []
		// const fragment_definitions = []
		// const definitions = []
		// // const vertex_body_lines = []
		// const fragment_body_lines = []
		// const body_lines = []

		// const shader_config = this.shader_config(this._shader_name)
		// const dependencies = shader_config.dependencies()

		// const definitions_by_shader_name = {}
		// definitions_by_shader_name[this._shader_name] = []
		// for(let dependency of dependencies){ definitions_by_shader_name[dependency] = [] }

		// const body_lines_by_shader_name = {}
		// body_lines_by_shader_name[this._shader_name] = []
		// for(let dependency of dependencies){ body_lines_by_shader_name[dependency] = [] }

		// let definition
		// let body_line
		// for(let output_name of this.used_output_names()){
		// 	const var_name = this.gl_var_name(output_name)

		// 	switch (output_name){
		// 		case 'frame':
		// 			definition = new Definition.Uniform(this, 'float', output_name)
		// 			// vertex_definitions.push(definition)
		// 			// fragment_definitions.push(definition)
		// 			definitions_by_shader_name[this._shader_name].push(definition)

		// 			body_line = `float ${var_name} = ${output_name}`
		// 			for(let dependency of dependencies){
		// 				definitions_by_shader_name[dependency].push(definition)
		// 				body_lines_by_shader_name[dependency].push(body_line)
		// 			}

		// 			// vertex_body_lines.push(`float ${var_name} = ${output_name}`)
		// 			body_lines.push(body_line)
		// 			break;
		// 		case 'gl_FragCoord':
		// 			if( this._shader_name == ShaderName.FRAGMENT ){
		// 				fragment_body_lines.push(`vec4 ${var_name} = gl_FragCoord`)
		// 			}
		// 			break;
		// 		case 'gl_PointCoord':
		// 			if( this._shader_name == ShaderName.FRAGMENT ){
		// 				if(this.parent().is_point_material()){
		// 					fragment_body_lines.push(`vec2 ${var_name} = gl_PointCoord`)
		// 				}
		// 			}
		// 			break;
		// 		default:
		// 			const named_output = this.named_output_by_name(output_name)
		// 			const gl_type = named_output.gl_type()
		// 			definition = new Definition.Varying(this, gl_type, var_name)
		// 			definitions_by_shader_name[this._shader_name].push(definition)

		// 			body_line = `${var_name} = vec3(${output_name})`
		// 			for(let dependency of dependencies){
		// 				definitions_by_shader_name[dependency].push(definition)
		// 				body_lines_by_shader_name[dependency].push(body_line)
		// 			}
		// 			if(dependencies.length == 0){
		// 				body_lines.push(body_line)
		// 			}
		// 	}
		// }
		// // this.set_vertex_definitions(vertex_definitions)
		// // this.set_fragment_definitions(fragment_definitions)
		// for(let shader_name of Object.keys(definitions_by_shader_name)){
		// 	this.set_definitions(definitions_by_shader_name[shader_name], shader_name)
		// }
		// for(let shader_name of Object.keys(body_lines_by_shader_name)){
		// 	this.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
		// }
		// // this.add_definitions(definitions)
		// // this.set_vertex_body_lines(vertex_body_lines)
		// // this.set_fragment_body_lines(fragment_body_lines)

		// this.add_body_lines(body_lines)
	}
}
