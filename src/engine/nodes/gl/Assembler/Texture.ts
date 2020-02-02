import {ShaderAssemblerRender} from './_BaseRender';
import {ParamType} from 'src/Engine/Param/_Module';
import {Connection} from 'src/Engine/Node/Gl/GlData';
import {Definition} from '../Definition/_Module';
// import {GlobalsTextureHandler} from 'src/Engine/Node/Gl/Assembler/Globals/Texture'

import TemplateDefault from './Template/Texture/Default.frag.glsl';

import {ShaderConfig} from './Config/ShaderConfig';
import {VariableConfig} from './Config/VariableConfig';
import {ShaderName, LineType} from 'src/Engine/Node/Gl/Assembler/Util/CodeBuilder';
import {ThreeToGl} from 'src/Core/ThreeToGl';
import {BaseNodeGl} from '../_Base';
import {Globals} from '../Globals';
import {NodeTraverser} from '../../utils/shaders/NodeTraverser';

export class ShaderAssemblerTexture extends ShaderAssemblerRender {
	_template_shader() {
		return {
			fragmentShader: TemplateDefault,
		};
	}

	fragment_shader() {
		return this._shaders_by_name['fragment'];
	}
	// async get_shaders(){
	// 	await this.update_shaders()
	// 	return this._shaders_by_name
	// }

	uniforms() {
		return this._uniforms;
	}
	_create_material() {
		console.warn('ShaderAssemblerTexture should not create a material');
		return null;
	}

	async update_fragment_shader() {
		this._lines = {};
		this._shaders_by_name = {};
		for (let shader_name of this.shader_names()) {
			const template = this._template_shader()[`${shader_name}Shader`];
			this._lines[shader_name] = template.split('\n');
		}
		if (this._root_nodes.length > 0) {
			// this._output_node.set_assembler(this)
			await this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}

		const new_uniforms = this.build_uniforms(null);
		this._uniforms = this._uniforms || {};
		for (let uniform_name of Object.keys(new_uniforms)) {
			this._uniforms[uniform_name] = new_uniforms[uniform_name];
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shader_names()) {
			this._shaders_by_name[shader_name] = this._lines[shader_name].join('\n');
		}

		// That's actually useless, since this doesn't make the texture recook
		const scene = this._gl_parent_node.scene();
		const id = this._gl_parent_node.graph_node_id();
		if (this.frame_dependent()) {
			scene.add_frame_dependent_uniform_owner(id, this._uniforms);
		} else {
			scene.remove_frame_dependent_uniform_owner(id);
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	add_output_params(output_child) {
		output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
	}
	add_globals_params(globals_node) {
		globals_node.set_named_outputs([
			new Connection.Vec2('gl_FragCoord'),
			// new Connection.Vec2('resolution'),
			new Connection.Float('frame'),
		]);
	}

	//
	//
	// CONFIGS
	//
	//
	create_shader_configs() {
		return [new ShaderConfig('fragment', ['color', 'alpha'], [])];
	}
	create_variable_configs() {
		return [
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = ',
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.a = ',
				default: '1.0',
			}),
		];
	}

	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected insert_define_after(shader_name) {
		return '// INSERT DEFINE';
	}
	protected insert_body_after(shader_name) {
		return '// INSERT BODY';
	}
	protected lines_to_remove(shader_name) {
		return ['// INSERT DEFINE', '// INSERT BODY'];
	}

	handle_gl_FragCoord(body_lines, shader_name, var_name) {
		if (shader_name == 'fragment') {
			body_lines.push(`vec2 ${var_name} = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y)`);
		}
	}

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//
	// add_export_body_line(
	// 	export_node: BaseNodeGl,
	// 	shader_name: ShaderName,
	// 	input_name: string,
	// 	input: BaseNodeGl,
	// 	variable_name: string
	// 	){
	// 	// console.log("add_export_body_line", export_node, shader_name, input_name)

	// 	// let input
	// 	// let variable_name
	// 	// if(export_node.type() == 'output'){
	// 	// 	input = export_node.named_input(input_name)
	// 	// 	variable_name = input_name
	// 	// } else {
	// 	// 	// if attribute
	// 	// 	input = export_node.connected_named_input()
	// 	// 	variable_name = export_node.attribute_name()
	// 	// }

	// 	if(input){
	// 		const var_input = export_node.variable_for_input(input_name)
	// 		const new_var = ThreeToGl.vector3(var_input)
	// 		if(new_var){
	// 			// const texture_variable = this._texture_allocations_controller.find_variable(
	// 			// 	export_node,
	// 			// 	shader_name,
	// 			// 	variable_name
	// 			// )
	// 			const texture_variable = this._texture_allocations_controller.variable(variable_name)
	// 			if(!texture_variable){
	// 				console.log(export_node.full_path(), shader_name, variable_name, input)
	// 			}
	// 			// if we are in the texture this variable is allocated to, we write it back
	// 			if(texture_variable.allocation().shader_name() == shader_name){
	// 				const component = texture_variable.component()

	// 				const line = `gl_FragColor.${component} = ${new_var}`
	// 				export_node.add_body_lines([line], shader_name)
	// 			}
	// 		}
	// 	}
	// }
	// add_import_body_line(
	// 	import_node: BaseNodeGl,
	// 	shader_name: ShaderName,
	// 	output_name: string,
	// 	variable_name: string
	// 	){
	// 		throw "not sure I want to use this method anymore"
	// 	const named_output = import_node.named_output_by_name(output_name)
	// 	const gl_type = named_output.gl_type()

	// 	const map_name = `texture_${shader_name}`
	// 	const definition = new Definition.Uniform(import_node, 'sampler2D', map_name)
	// 	// definitions_by_shader_name[import_node._shader_name].push(definition)
	// 	import_node.add_definitions([definition])

	// 	const var_name = import_node.gl_var_name(output_name)

	// 	const texture_variable = this._texture_allocations_controller.find_variable(
	// 		import_node,
	// 		shader_name,
	// 		variable_name
	// 	)
	// 	if(!texture_variable){
	// 		this._texture_allocations_controller.print(this._gl_parent_node.scene())
	// 		console.error(`no texture_variable found for shader '${shader_name}' and variable '${variable_name}'`, import_node.full_path())
	// 		console.log("this._texture_allocations_controller", this._texture_allocations_controller)
	// 	}
	// 	const component = texture_variable.component()
	// 	const lines = [
	// 		`${gl_type} ${var_name} = texture2D( ${map_name}, particleUV ).${component}`,
	// 		`gl_FragColor.${component} = ${var_name}`
	// 	]
	// 	import_node.add_body_lines(lines, shader_name)
	// }

	// set_node_lines_output(output_node: BaseNodeGl, shader_name: ShaderName){
	// 	const input_names = this.input_names_for_shader_name(output_node, shader_name)
	// 	output_node.set_body_lines([], shader_name)
	// 	if(input_names){
	// 		for(let input_name of input_names){
	// 			const input = output_node.named_input(input_name)
	// 			const variable_name = input_name

	// 			if (input){
	// 				this.add_export_body_line(
	// 					output_node,
	// 					shader_name,
	// 					input_name,
	// 					input,
	// 					variable_name
	// 					)

	// 			} else {
	// 				// position reads the default attribute position
	// 				// or maybe there is no need?
	// 				// if(input_name == 'position'){
	// 				// 	this.globals_handler().read_attribute(output_node, 'vec3', 'position')
	// 				// }
	// 			}

	// 		}
	// 	}
	// }
	// set_node_lines_attribute(attribute_node: Attribute, shader_name: ShaderName){

	// 	if(attribute_node.is_importing()){
	// 		const gl_type = attribute_node.gl_type()
	// 		const attribute_name = attribute_node.attribute_name()
	// 		const new_value = this.globals_handler().read_attribute(
	// 			attribute_node,
	// 			gl_type,
	// 			attribute_name,
	// 			shader_name
	// 			)
	// 		const var_name = attribute_node.gl_var_name(Attribute.output_name())
	// 		const body_line = `${gl_type} ${var_name} = ${new_value}`
	// 		attribute_node.add_body_lines([body_line])

	// 		// re-export to ensure it is available on next frame
	// 		const texture_variable = this._texture_allocations_controller.variable(attribute_name)
	// 		if(texture_variable.allocation().shader_name() == shader_name){

	// 			const variable = this._texture_allocations_controller.variable(attribute_name)
	// 			const component = variable.component()
	// 			attribute_node.add_body_lines([
	// 				`gl_FragColor.${component} = ${var_name}`
	// 			])
	// 		}

	// 		// this.add_import_body_line(
	// 		// 	attribute_node,
	// 		// 	shader_name,
	// 		// 	Attribute.output_name(),
	// 		// 	attribute_node.attribute_name()
	// 		// 	)
	// 	}
	// 	if(attribute_node.is_exporting()){
	// 		const input = attribute_node.connected_named_input()
	// 		const variable_name = attribute_node.attribute_name()

	// 		this.add_export_body_line(
	// 			attribute_node,
	// 			shader_name,
	// 			Attribute.input_name(),
	// 			input,
	// 			variable_name
	// 			)
	// 	}
	// }
	// set_node_lines_globals(globals_node: Globals, shader_name: ShaderName){
	// 	const vertex_definitions = []
	// 	const fragment_definitions = []
	// 	const definitions = []
	// 	// const vertex_body_lines = []
	// 	const fragment_body_lines = []
	// 	const body_lines = []

	// 	// const shader_config = this.shader_config(shader_name)
	// 	// const dependencies = shader_config.dependencies()

	// 	const definitions_by_shader_name = {}
	// 	definitions_by_shader_name[shader_name] = []
	// 	// for(let dependency of dependencies){ definitions_by_shader_name[dependency] = [] }

	// 	// const body_lines_by_shader_name = {}
	// 	// body_lines_by_shader_name[shader_name] = []
	// 	// for(let dependency of dependencies){ body_lines_by_shader_name[dependency] = [] }

	// 	// console.log("this.used_output_names()", this.used_output_names())
	// 	let definition
	// 	let body_line
	// 	for(let output_name of globals_node.used_output_names()){
	// 		const var_name = globals_node.gl_var_name(output_name)

	// 		switch (output_name){
	// 			case 'frame':
	// 				definition = new Definition.Uniform(globals_node, 'float', output_name)
	// 				// vertex_definitions.push(definition)
	// 				// fragment_definitions.push(definition)
	// 				definitions_by_shader_name[globals_node._shader_name].push(definition)

	// 				body_line = `float ${var_name} = ${output_name}`
	// 				// for(let dependency of dependencies){
	// 				// 	definitions_by_shader_name[dependency].push(definition)
	// 				// 	body_lines_by_shader_name[dependency].push(body_line)
	// 				// }

	// 				// vertex_body_lines.push(`float ${var_name} = ${output_name}`)
	// 				body_lines.push(body_line)
	// 				break;

	// 			default:
	// 				// console.log("add_import_body_line", globals_node, shader_name)
	// 				// this.add_import_body_line(globals_node, shader_name, output_name, output_name)
	// 				const named_output = globals_node.named_output_by_name(output_name)
	// 				const gl_type = named_output.gl_type()

	// 				const attrib_read = this.globals_handler().read_attribute(
	// 					globals_node,
	// 					gl_type,
	// 					output_name,
	// 					shader_name
	// 				)
	// 				body_line = `${gl_type} ${var_name} = ${attrib_read}`
	// 				body_lines.push(body_line)
	// 				//

	// 				// const map_name = `texture_${output_name}`
	// 				// definition = new Definition.Uniform(globals_node, 'sampler2D', map_name)
	// 				// definitions_by_shader_name[globals_node._shader_name].push(definition)

	// 				// body_line = `${gl_type} ${var_name} = texture2D( ${map_name}, particleUV ).xyz`

	// 				// // // if(dependencies.length == 0){
	// 				// body_lines.push(body_line)
	// 				// }
	// 		}
	// 	}
	// 	// this.set_vertex_definitions(vertex_definitions)
	// 	// this.set_fragment_definitions(fragment_definitions)
	// 	for(let shader_name of Object.keys(definitions_by_shader_name)){
	// 		globals_node.add_definitions(definitions_by_shader_name[shader_name], shader_name)
	// 	}
	// 	// for(let shader_name of Object.keys(body_lines_by_shader_name)){
	// 	// 	globals_node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
	// 	// }
	// 	// this.add_definitions(definitions)
	// 	// this.set_vertex_body_lines(vertex_body_lines)
	// 	// this.set_fragment_body_lines(fragment_body_lines)

	// 	globals_node.add_body_lines(body_lines)
	// }
}
