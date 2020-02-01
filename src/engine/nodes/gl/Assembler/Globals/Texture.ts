import {GlobalsBaseController} from './_Base'
import { Globals } from '../../Globals';
import {BaseNodeGl} from '../../_Base';
import {Definition} from '../../Definition/_Module'
import { VariableConfig } from '../Config/VariableConfig';
import {TextureAllocationsController} from '../Util/TextureAllocationsController'
import {GlobalsGeometryHandler} from './Geometry'

import {DefinitionBaseConfig} from '../Config/DefinitionBaseConfig'
import {UniformConfig} from '../Config/UniformConfig'
import {AttributeConfig} from '../Config/AttributeConfig'
import { Attribute } from '../../Attribute';

export class GlobalsTextureHandler extends GlobalsBaseController {

	private _texture_allocations_controller: TextureAllocationsController

	static UV_ATTRIB = 'particles_sim_uv_attrib'
	static UV_VARYING = 'particles_sim_uv_varying'
	static PARTICLE_SIM_UV = 'particleUV'

	private globals_geometry_handler: GlobalsGeometryHandler;

	constructor(private _uv_name: string){
		super()
	}

	set_texture_allocations_controller(controller){
		this._texture_allocations_controller = controller
	}

	handle(
		globals_node: Globals,
		output_name: string,
		definitions_by_shader_name: object,
		body_lines_by_shader_name: object,
		body_lines: string[],
		dependencies: string[],
		shader_name: string,
	){
		const named_output = globals_node.named_output_by_name(output_name)
		const var_name = globals_node.gl_var_name(output_name)

		const variable = this._texture_allocations_controller.variable(output_name)

		if(variable){
			const gl_type = named_output.gl_type()
			const new_value = this.read_attribute(globals_node, gl_type, output_name, shader_name)
			const body_line = `${gl_type} ${var_name} = ${new_value}`
			globals_node.add_body_lines([body_line])
		} else {
			this.globals_geometry_handler = this.globals_geometry_handler || new GlobalsGeometryHandler()
			this.globals_geometry_handler.handle(
				globals_node,
				output_name,
				definitions_by_shader_name,
				body_lines_by_shader_name,
				body_lines,
				dependencies,
				shader_name
			)
		}

		// definitions
		// const gl_type = named_output.gl_type()
		// const definition = new Definition.Varying(globals_node, gl_type, var_name)
		// definitions_by_shader_name[shader_name].push(definition)

		// const new_value = this.read_attribute(globals_node, gl_type, output_name)
		// const body_line = `${var_name} = ${new_value}`
		// if(allocation){
		// 	const var_name_texture = allocation.texture_name()
		// 	// add another definition if a texture was allocated by ParticlesSystemGPU
		// 	const texture_definition = new Definition.Uniform(globals_node, 'sampler2D', var_name_texture)
		// 	definitions_by_shader_name[shader_name].push(texture_definition)

		// 	// const particles_sim_uv_definition = new Definition.Attribute(globals_node, 'vec2', GlobalsTextureHandler.UV_ATTRIB)
		// 	// definitions_by_shader_name['vertex'].push(particles_sim_uv_definition)
		// 	// this.add_particles_sim_uv_attribute(globals_node)
			
		// 	const new_value = this.read_attribute(globals_node, gl_type, output_name, shader_name)
		// 	body_line = `${var_name} = ${new_value}`

		// } else {
		// 	body_line = `${var_name} = vec3(${output_name})`
		// }


		// const new_body_lines = [
		// 	// `${var_name} = vec3(${output_name})`,
		// 	`vec3 ${var_name} = texture2D( ${var_name_texture}, uv ).xyz;`
		// ]
		// const body_line = `vec3 ${var_name} = texture2D( ${var_name_texture}, uv ).xyz`
		
		// for(let dependency of dependencies){
		// 	definitions_by_shader_name[dependency].push(definition)
		// 	body_lines_by_shader_name[dependency].push(body_line)
		// }
		// if(dependencies.length == 0){
		// 	body_lines.push(body_line)
		// }
	}
	variable_config_default(variable_name:string):string{
		// const allocation = this._texture_allocations_controller.allocation_for_variable(variable_name)
		// if(allocation){
		// 	return `texture2D( texture_${allocation.name()}, ${GlobalsTextureHandler.UV_VARYING} ).xyz`
		// } else {
		// 	GlobalsGeometryHandler.variable_config_default(variable_name)
		// }
		throw "do I go through here?"
		return this.read_attribute(variable_name)
	}
	// variable_config_required_definitions(variable_name:string):DefinitionBaseConfig[]{
	// 	const allocation = this._texture_allocations_controller.allocation_for_variable(variable_name)
	// 	if(allocation){
	// 		return [
	// 			new AttributeConfig('vec2', GlobalsTextureHandler.UV_ATTRIB),
	// 			new UniformConfig('sampler2D', `texture_${allocation.name()}`)
	// 		]
	// 	}
	// }

	// static remap_instance_attribute(name:string):string{
	// 	if(name == 'instancePosition'){
	// 		return 'position'
	// 	}
	// 	return name
	// }
	// static variable_name_to_instance_attrib(name:string):string{
	// 	if(name == 'position'){
	// 		return 'instancePosition'
	// 	}
	// 	return name
	// }

	read_attribute(node: BaseNodeGl, gl_type:string, attrib_name:string, shader_name: string){
		// attrib_name = GlobalsTextureHandler.remap_instance_attribute(attrib_name)

		const texture_variable = this._texture_allocations_controller.variable(attrib_name)

		if(texture_variable){
			this.add_particles_sim_uv_attribute(node)
			// const texture_variable = allocation.variable(attrib_name)
			// if(!texture_variable){
			// 	console.error(`no tex var found for ${attrib_name}`)
			// 	this._texture_allocations_controller.print(node.scene())
			// }
			const component = texture_variable.component()
			const allocation = texture_variable.allocation()

			// const definitions_by_shader_name = {}
			// definitions_by_shader_name[shader_name] = []
			const var_name_texture = allocation.texture_name()
			const texture_definition = new Definition.Uniform(node, 'sampler2D', var_name_texture)
			// definitions_by_shader_name[shader_name].push(texture_definition)

			node.add_definitions([texture_definition])

			// const particles_sim_uv_definition = new Definition.Attribute(globals_node, 'vec2', 'particles_sim_uv')
			// definitions_by_shader_name['vertex'].push(particles_sim_uv_definition)
			const body_line = `texture2D( ${var_name_texture}, ${this._uv_name} ).${component}`
			return body_line

		} else {
			return GlobalsGeometryHandler.read_attribute(node, gl_type, attrib_name, shader_name)
		}
	}

	add_particles_sim_uv_attribute(node: BaseNodeGl){
		const shader_names = ['vertex', 'fragment']
		const definitions_by_shader_name = {}
		for(let shader_name of shader_names){ definitions_by_shader_name[shader_name] = [] }

		const particles_sim_uv_attrib_definition = new Definition.Attribute(node, 'vec2', GlobalsTextureHandler.UV_ATTRIB)
		const particles_sim_uv_varying_definition = new Definition.Varying(node, 'vec2', GlobalsTextureHandler.UV_VARYING)

		node.add_definitions([
			particles_sim_uv_attrib_definition,
			particles_sim_uv_varying_definition
		], 'vertex')
		node.add_definitions([
			particles_sim_uv_varying_definition
		], 'fragment')

		node.add_body_lines([
			`${GlobalsTextureHandler.UV_VARYING} = ${GlobalsTextureHandler.UV_ATTRIB}`
		], 'vertex')

	}
}