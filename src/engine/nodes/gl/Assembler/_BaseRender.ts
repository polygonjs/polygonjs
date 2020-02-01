
import {BaseShaderAssembler} from './_Base'

import {Definition} from '../Definition/_Module'
import { ThreeToGl } from 'src/Core/ThreeToGl';
import { Output } from '../Output';
import {Attribute} from '../Attribute'
// import {GlobalsGeometryHandler} from './Globals/Geometry'


export abstract class ShaderAssemblerRender extends BaseShaderAssembler {

	private _assemblers_by_custom_name = {}

	async get_custom_materials(){
		const custom_materials = {}
		this._assemblers_by_custom_name = this._assemblers_by_custom_name || {}

		const class_by_custom_name = this.custom_assembler_class_by_custom_name()
		for(let custom_name of Object.keys(class_by_custom_name)){
			const assembler_class = class_by_custom_name[custom_name]
			// const assembler = new assembler_class(this._gl_parent_node)
			this._assemblers_by_custom_name[custom_name] = this._assemblers_by_custom_name[custom_name] || new assembler_class(this._gl_parent_node)
			const assembler = this._assemblers_by_custom_name[custom_name]
			assembler.set_root_nodes(this._root_nodes)
			assembler.set_param_configs_owner(this._code_builder)
			assembler.set_shader_configs(this.shader_configs())
			assembler.set_variable_configs(this.variable_configs())
			custom_materials[custom_name] = await assembler.get_material(this)

			// add needsUpdate = true, as we always get the same material
			custom_materials[custom_name].needsUpdate = true
		}

		return custom_materials
	}
	shadow_assembler_class_by_custom_name(){
		return {}
	}

	add_output_body_line(output_node, shader_name: string, input_name: string){
		const input = output_node.named_input(input_name)
		const var_input = output_node.variable_for_input(input_name)
		const variable_config = this.variable_config(input_name)

		let new_var
		if(input){
			new_var = ThreeToGl.vector3(var_input)
		} else {
			if(variable_config.default_from_attribute()){
				const named_connection = output_node.named_connection(input_name)
				const gl_type = named_connection.type()
				new_var = this.globals_handler().read_attribute(
					output_node,
					gl_type,
					input_name,
					shader_name
				)
			} else {
				new_var = variable_config.default()
			}
			// const default_value = variable_config.default()
			// new_var = default_value
			// console.log("default_value", new_var)
			// const definition_configs = variable_config.required_definitions() || []
			// for(let definition_config of definition_configs){
			// 	const definition = definition_config.create_definition(output_node)
			// 	console.log("definition", definition)
			// 	output_node.add_definitions([definition])
			// }
		}
		if(new_var){
			const prefix = variable_config.prefix()
			const suffix = variable_config.suffix()
			const if_condition = variable_config.if_condition()
			if(if_condition){ output_node.add_body_lines([`#if ${if_condition}`], shader_name) }
			output_node.add_body_lines([`${prefix}${new_var}${suffix}`], shader_name)
			if(if_condition){ output_node.add_body_lines([`#endif`], shader_name) }
		}
	}

	set_node_lines_output(output_node: Output, shader_name: string){

		const body_lines = []
		const input_names = this.shader_config(shader_name).input_names()
		output_node.set_body_lines([], shader_name)
		if(input_names){
			for(let input_name of input_names){
				this.add_output_body_line(output_node, shader_name, input_name)

			}
		}

	}
	set_node_lines_attribute(attribute_node, shader_name){

		// const named_output = attribute_node.connected_output()
		// const named_connection = attribute_node.connected_input()
		const gl_type = attribute_node.gl_type()
		const new_var = this.globals_handler().read_attribute(
			attribute_node,
			gl_type,
			attribute_node.attribute_name(),
			shader_name
		)
		const var_name = attribute_node.gl_var_name(Attribute.output_name())
		attribute_node.add_body_lines([
			`${gl_type} ${var_name} = ${new_var}`
		], shader_name)
		// this.add_output_body_line(
		// 	attribute_node,
		// 	shader_name,
		// 	input_name
		// 	)

		// const vertex_definitions = []
		// const vertex_body_lines = []
		// const fragment_definitions = []

		// const named_output = attribute_node.named_outputs()[0]
		// const gl_type = named_output.type()
		// const var_name = attribute_node.gl_var_name(named_output.name())

		// const attribute_name = attribute_node.attribute_name()
		// // TODO: I should probably raise an error in the node
		// // maybe when doint the initial eval of all nodes and check for errors?
		// if(!attribute_name){
		// 	console.error(attribute_node.full_path())
		// 	throw new Error("empty attr name")
		// }
		// if(GlobalsGeometryHandler.PRE_DEFINED_ATTRIBUTES.indexOf(attribute_name) < 0){
		// 	vertex_definitions.push(new Definition.Attribute(attribute_node, gl_type, attribute_name))
		// }
		// vertex_definitions.push(new Definition.Varying(attribute_node, gl_type, var_name))
		// vertex_body_lines.push( `${var_name} = ${attribute_name}` )
		// fragment_definitions.push(new Definition.Varying(attribute_node, gl_type, var_name))

		// attribute_node.set_definitions(vertex_definitions, 'vertex')
		// attribute_node.set_definitions(fragment_definitions, 'fragment')
		// attribute_node.add_body_lines(vertex_body_lines, 'vertex')
	}

	handle_gl_FragCoord(body_lines, shader_name, var_name){
		if( shader_name == 'fragment' ){
			body_lines.push(`vec4 ${var_name} = gl_FragCoord`)
		}
	}
	handle_resolution(body_lines, shader_name, var_name){
		if( shader_name == 'fragment' ){
			body_lines.push(`vec2 ${var_name} = resolution`)
		}
	}

	set_node_lines_globals(globals_node, shader_name){
		const vertex_definitions = []
		const fragment_definitions = []
		const definitions = []
		// const vertex_body_lines = []
		const fragment_body_lines = []
		const body_lines = []

		const shader_config = this.shader_config(shader_name)
		const dependencies = shader_config.dependencies()

		const definitions_by_shader_name = {}
		definitions_by_shader_name[shader_name] = []
		for(let dependency of dependencies){ definitions_by_shader_name[dependency] = [] }

		const body_lines_by_shader_name = {}
		body_lines_by_shader_name[shader_name] = []
		for(let dependency of dependencies){ body_lines_by_shader_name[dependency] = [] }

		// console.log("this.used_output_names()", this.used_output_names())
		let definition
		let body_line
		for(let output_name of globals_node.used_output_names()){
			const var_name = globals_node.gl_var_name(output_name)

			switch (output_name){
				case 'frame':
					definition = new Definition.Uniform(globals_node, 'float', output_name)
					definitions_by_shader_name[globals_node._shader_name].push(definition)

					body_line = `float ${var_name} = ${output_name}`
					for(let dependency of dependencies){
						definitions_by_shader_name[dependency].push(definition)
						body_lines_by_shader_name[dependency].push(body_line)
					}

					// vertex_body_lines.push(`float ${var_name} = ${output_name}`)
					body_lines.push(body_line)
					this.set_frame_dependent()
					break;
				case 'gl_FragCoord':
					this.handle_gl_FragCoord(body_lines, shader_name, var_name)
					break;

				case 'resolution':
					this.handle_resolution(body_lines, shader_name, var_name)
					definition = new Definition.Uniform(globals_node, 'vec2', output_name)
					definitions_by_shader_name[globals_node._shader_name].push(definition)
					for(let dependency of dependencies){
						definitions_by_shader_name[dependency].push(definition)
					}

					this.set_resolution_dependent()
					break;

				case 'gl_PointCoord':
					if( shader_name == 'fragment' ){
						body_lines.push(`vec2 ${var_name} = gl_PointCoord`)
					}
					break;
				default:
					// const named_output = globals_node.named_output_by_name(output_name)
					// const gl_type = named_output.gl_type()
					// const new_var = this.globals_handler().read_attribute(
					// 	globals_node,
					// 	gl_type,
					// 	output_name
					// )
					// const body_line = `${var_name} = ${new_var}`
					// globals_node.add_body_lines([body_line])
					this.globals_handler().handle(
						globals_node,
						output_name,
						definitions_by_shader_name,
						body_lines_by_shader_name,
						body_lines,
						dependencies,
						shader_name
					)
					// const named_output = globals_node.named_output_by_name(output_name)
					// const gl_type = named_output.gl_type()
					// definition = new Definition.Varying(globals_node, gl_type, var_name)
					// definitions_by_shader_name[shader_name].push(definition)
					// console.log("this.handler", this.globals_handler_class())
					// throw "debug"

					// body_line = `${var_name} = vec3(${output_name})`
					// for(let dependency of dependencies){
					// 	definitions_by_shader_name[dependency].push(definition)
					// 	body_lines_by_shader_name[dependency].push(body_line)
					// }
					// if(dependencies.length == 0){
					// 	body_lines.push(body_line)
					// }
			}
		}
		// this.set_vertex_definitions(vertex_definitions)
		// this.set_fragment_definitions(fragment_definitions)
		for(let shader_name of Object.keys(definitions_by_shader_name)){
			globals_node.add_definitions(definitions_by_shader_name[shader_name], shader_name)
		}
		for(let shader_name of Object.keys(body_lines_by_shader_name)){
			globals_node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
		}
		// this.add_definitions(definitions)
		// this.set_vertex_body_lines(vertex_body_lines)
		// this.set_fragment_body_lines(fragment_body_lines)

		globals_node.add_body_lines(body_lines)
	}
}
