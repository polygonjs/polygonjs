import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderChunk} from 'three/src/renderers/shaders/ShaderChunk'
// import {Shader} from 'three/src/renderers/shaders/ShaderLib'
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial'
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial'
import {Material} from 'three/src/materials/Material'
import {Vector2} from 'three/src/math/Vector2'
const THREE = {Material, MeshPhysicalMaterial, MeshStandardMaterial, ShaderChunk, ShaderMaterial, UniformsUtils, Vector2}
import lodash_times from 'lodash/times'
// import lodash_range from 'lodash/range'

import {ParamType} from 'src/Engine/Param/_Module'
import {Connection} from 'src/Engine/Node/Gl/GlData'
import {ShaderName, LineType} from 'src/Engine/Node/Gl/Assembler/Util/CodeBuilder'
// import {Output} from 'src/Engine/Node/Gl/Output'

import {ShaderConfig} from './Config/ShaderConfig'
import {VariableConfig} from './Config/VariableConfig'
import {ThreeToGl} from 'src/Core/ThreeToGl'
// const BODY_SPLIT_LINE = 'void main() {'
// export const BODY_SEPARATOR_LINES = lodash_range(3).map(i=>'	')
import {CodeBuilder} from './Util/CodeBuilder'
import { BaseNode } from "src/Engine/Node/_Base";
import { BaseNodeGl } from "../_Base";
import {GlobalsGeometryHandler} from './Globals/Geometry'

interface StringArrayByString {
	[propName: string]: string[]
}


export abstract class BaseShaderAssembler {

	protected _shaders_by_name = {}
	_lines: StringArrayByString
	private _code_builder: CodeBuilder
	private _param_config_owner: CodeBuilder
	protected _root_nodes: BaseNodeGl[] = []
	protected _leaf_nodes: BaseNodeGl[] = []
	protected _material: THREE.Material

	private _shader_configs: ShaderConfig[]
	private _variable_configs: VariableConfig[]

	private _frame_dependent: boolean = false
	private _resolution_dependent: boolean = false

	constructor(
		private _gl_parent_node: BaseNode
	){}

	async get_material(master_assembler?: BaseShaderAssembler){
		this._material = this._material || this._create_material()

		await this._update_material(master_assembler)
		return this._material
	}
	_template_shader_for_shader_name(shader_name: string){
		return this._template_shader()[`${shader_name}Shader`]
	}

	globals_handler(){
		return this._gl_parent_node.globals_handler()
	}

	shaders_by_name(){
		return this._shaders_by_name
	}

	abstract _create_material()
	protected _build_lines(){
		for(let shader_name of this.shader_names()){
			const template = this._template_shader_for_shader_name(shader_name)
			this._replace_template(template, shader_name)
		}
	}

	// protected _build_lines_for_shader_name(shader_name: string){
	// 	const template = this._template_shader()
	// 	this._replace_template(template[`${shader_name}Shader`], shader_name)
	// }

	set_root_nodes(root_nodes: BaseNodeGl[]){
		this._root_nodes = root_nodes
	}
	abstract _template_shader(): any//THREE.Shader - could not find the import?
	// abstract _color_declaration(): string
	async _update_material(master_assembler?: BaseShaderAssembler){
		const template_shader = this._template_shader()
		this._lines = {}
		for(let shader_name of this.shader_names()){
			this._lines[shader_name] = template_shader[`${shader_name}Shader`].split('\n')
		}
		if(this._root_nodes.length > 0){
			// this._output_node.set_color_declaration(this._color_declaration())
			// if(!master_assembler){
				// this._output_node.set_assembler(this)
				await this.build_code_from_nodes(this._root_nodes)
			// }

			this._material.extensions = {derivatives: true}
			this._build_lines()
			// this._lines[ShaderName.FRAGMENT].unshift('#extension GL_OES_standard_derivatives : enable')
		}

		for(let param_config of this.param_configs()){
			param_config.material = this._material
		}

		// instead of replacing fully the uniforms,
		// I simply add to them the new ones or replace the existing ones
		// otherwise this would break the particles_system_gpu
		// which would not reset correctly when going back to first frame.
		// Not entirely sure why, but this seems to be due to the texture uniforms
		// which are removed and then readded. This seems to mess up somewhere with how
		// the material updates itself...
		// this._material.uniforms = this.build_uniforms(template_shader)
		const new_uniforms = this.build_uniforms(template_shader)
		this._material.uniforms = this._material.uniforms || {}
		for(let uniform_name of Object.keys(new_uniforms)){
			this._material.uniforms[uniform_name] = new_uniforms[uniform_name]
		}

		for(let shader_name of this.shader_names()){
			this._material[`${shader_name}Shader`] = this._lines[shader_name].join('\n')
		}

		const scene = this._gl_parent_node.scene()
		// const id = this._gl_parent_node.graph_node_id()
		if(this.frame_dependent()){
			// make sure not to use this._gl_parent_node.graph_node_id() as the id,
			// as we need several materials:
			// - the visible one
			// - the multiple shadow ones
			// - and possibly a depth one
			scene.add_frame_dependent_uniform_owner(this._material.uuid, this._material.uniforms)
		} else {
			scene.remove_frame_dependent_uniform_owner(this._material.uuid)
		}

		if(this.resolution_dependent()){
			scene.add_resolution_dependent_uniform_owner(this._material.uuid, this._material.uniforms)
		} else {
			scene.remove_resolution_dependent_uniform_owner(this._material.uuid)
		}


	}

	private build_uniforms(template_shader=null){

		const uniforms = template_shader ? THREE.UniformsUtils.clone( template_shader.uniforms ) : {}
		for(let param_config of this.param_configs()){
			uniforms[param_config.uniform_name()] = param_config.uniform()
		}

		if(this.frame_dependent()){
			uniforms['frame'] = {
				type: '1f',
				value: this._gl_parent_node.scene().frame()
			}
		}
		if(this.resolution_dependent()){
			uniforms['resolution'] = {
				value: new THREE.Vector2(1000, 1000)
			}
		}

		return uniforms
	}

	//
	//
	// ROOT NODES AND SHADER NAMES
	//
	//
	root_nodes_by_shader_name(shader_name: string): BaseNodeGl[] {
		// return this._root_nodes
		const list = []
		for(let node of this._root_nodes){
			switch(node.type()){
				case 'output':{
					list.push(node)
					break;
				}
				case 'attribute':{
					const attrib_name = node.attribute_name()
					const variable = this._texture_allocations_controller.variable(attrib_name)
					if(variable){
						const allocation_shader_name = variable.allocation().shader_name()
						if(allocation_shader_name == shader_name){
							list.push(node)
						}
					}
					break;
				}
			}
		}
		return list
	}
	leaf_nodes_by_shader_name(shader_name: string): BaseNodeGl[] {
		const list = []
		for(let node of this._leaf_nodes){
			switch(node.type()){
				case 'globals':{
					list.push(node)
					break;
				}
				case 'attribute':{
					const attrib_name = node.attribute_name()
					const variable = this._texture_allocations_controller.variable(attrib_name)
					if(variable){
						const allocation_shader_name = variable.allocation().shader_name()
						if(allocation_shader_name == shader_name){
							list.push(node)
						}
					}
					break;
				}
			}
		}
		return list
	}




	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	code_builder(){
		return this._code_builder = this._code_builder || new CodeBuilder(this, this._gl_parent_node)
	}
	async build_code_from_nodes(root_nodes: BaseNodeGl[]){
		await this.code_builder().build_from_nodes(root_nodes)
	}
	allow_new_param_configs(){
		this.code_builder().allow_new_param_configs()
	}
	disallow_new_param_configs(){
		this.code_builder().disallow_new_param_configs()
	}
	builder_param_configs(){
		return this.code_builder().param_configs()
	}
	builder_lines(shader_name: string, line_type: LineType): string[]{
		return this.code_builder().lines(shader_name, line_type)
	}
	all_builder_lines(){
		return this.code_builder().all_lines()
	}
	param_configs(){
		const code_builder = this._param_config_owner || this.code_builder()
		return code_builder.param_configs()
	}
	set_param_configs_owner(param_config_owner: CodeBuilder){
		this._param_config_owner = param_config_owner
		if(this._param_config_owner){
			this.code_builder().disallow_new_param_configs()
		} else {
			this.code_builder().allow_new_param_configs()
		}
	}







	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	static add_output_params(output_child){
		output_child.add_param( ParamType.VECTOR, 'position', [0,0,0], {hidden: true} )
		output_child.add_param( ParamType.VECTOR, 'normal', [0,0,0], {hidden: true} )
		output_child.add_param( ParamType.COLOR, 'color', [1,1,1], {hidden: true} )
		output_child.add_param( ParamType.FLOAT, 'alpha', 1, {hidden: true} )
		output_child.add_param( ParamType.VECTOR2, 'uv', [0,0], {hidden: true} )
	}
	add_output_params(output_child){
		BaseShaderAssembler.add_output_params(output_child)
	}
	static create_globals_node_output_connections(){
		return [
			new Connection.Vec3('position'),
			new Connection.Vec3('normal'),
			new Connection.Vec3('color'),
			new Connection.Vec2('uv'),
			new Connection.Vec4('gl_FragCoord'),
			new Connection.Vec2('resolution'),
			// new Connection.Vec2('gl_PointCoord'),
			// new TypedConnectionVec2('uv'),
			new Connection.Float('frame')
		]
	}
	create_globals_node_output_connections(){
		return BaseShaderAssembler.create_globals_node_output_connections()
	}
	add_globals_params(globals_node){
		globals_node.set_named_outputs(
			this.create_globals_node_output_connections()
		)
	}
	allow_attribute_exports(){
		return false
	}












	//
	//
	// CONFIGS
	//
	//
	reset_configs(){
		this._reset_shader_configs()
		this._reset_variable_configs()
		this._reset_frame_dependency()
		this._reset_resolution_dependency()
	}
	shader_configs(){
		return this._shader_configs = this._shader_configs || this.create_shader_configs()
	}
	set_shader_configs(shader_configs){
		this._shader_configs = shader_configs
	}
	shader_names(){
		return this.shader_configs().map(sc=>sc.name())
	}
	protected _reset_shader_configs(){
		this._shader_configs = null
		this.shader_configs()
	}
	create_shader_configs(){
		return [
			new ShaderConfig('vertex', ['position', 'normal', 'uv'], []),
			new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		]
	}
	shader_config(name: string): ShaderConfig{
		return this.shader_configs().filter(sc=>{
			return sc.name() == name
		})[0]
	}
	variable_configs(){
		return this._variable_configs = this._variable_configs || this.create_variable_configs()
	}
	set_variable_configs(variable_configs){
		this._variable_configs = variable_configs
	}
	variable_config(name: string){
		return this.variable_configs().filter(vc=>{
			return vc.name() == name
		})[0]
	}
	static create_variable_configs(){
		return [
			new VariableConfig('position', {
				default_from_attribute: true,
				// default: this.globals_handler().variable_config_default('position'),
				// required_definitions: this.globals_handler().variable_config_required_definitions('position'),
				prefix: 'vec3 transformed = '
			}),
			new VariableConfig('normal', {
				default_from_attribute: true,
				prefix: 'vec3 objectNormal = ',
				post_lines: [
					'#ifdef USE_TANGENT',
					'vec3 objectTangent = vec3( tangent.xyz );',
					'#endif',
				]
			}),
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = '
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.a = '
			}),
			new VariableConfig('uv', {
				// default_from_attribute: true,
				prefix: 'vUv = ',
				if: GlobalsGeometryHandler.IF_RULE.uv
			}),
		]
	}
	create_variable_configs(){
		return BaseShaderAssembler.create_variable_configs()
	}
	protected _reset_variable_configs(){
		this._variable_configs = null
		this.variable_configs()
	}
	input_names_for_shader_name(root_node: BaseNodeGl, shader_name: string){
		return this.shader_config(shader_name).input_names()
	}

	// frame dependency
	protected _reset_frame_dependency(){
		this._frame_dependent = false
	}
	set_frame_dependent(){
		this._frame_dependent = true
	}
	frame_dependent():boolean{
		return this._frame_dependent
	}
	// resolution dependency
	protected _reset_resolution_dependency(){
		this._resolution_dependent = false
	}
	set_resolution_dependent(){
		this._resolution_dependent = true
	}
	resolution_dependent():boolean{
		return this._resolution_dependent
	}









	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected insert_define_after(shader_name){
		return {
			vertex: '#include <common>',
			fragment: '#include <common>'
		}[shader_name]
	}
	protected insert_body_after(shader_name){
		return {
			vertex: '#include <color_vertex>',
			fragment: 'vec4 diffuseColor = vec4( diffuse, opacity );'
		}[shader_name]
	}
	protected lines_to_remove(shader_name){
		return {
			vertex: [
				'#include <begin_vertex>',
				'#include <beginnormal_vertex>',
			],
			fragment: []
		}[shader_name] || []
	}










	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//


	private _replace_template(template: string, shader_name: string){
		const function_declaration = this.builder_lines(shader_name, LineType.FUNCTION_DECLARATION)
		const define = this.builder_lines(shader_name, LineType.DEFINE)
		const all_define = function_declaration.concat(define)
		const body = this.builder_lines(shader_name, LineType.BODY)

		let template_lines = template.split('\n')
		const scene = this._gl_parent_node.scene()
		const new_lines = [
			`#define FPS ${ThreeToGl.float(scene.fps())}`,
			`#define TIME_INCREMENT (1.0/${ThreeToGl.float(scene.fps())})`,
			`#define FRAME_RANGE_START ${ThreeToGl.float(scene.frame_range()[0])}`,
			`#define FRAME_RANGE_END ${ThreeToGl.float(scene.frame_range()[1])}`,
		]

		const line_before_define = this.insert_define_after(shader_name)
		const line_before_body = this.insert_body_after(shader_name)
		const lines_to_remove = this.lines_to_remove(shader_name)
		let line_before_define_found = false
		let line_before_body_found = false

		for(let template_line of template_lines){
			

			if(line_before_define_found == true){
				this._insert_lines(new_lines, all_define)
				line_before_define_found = false
			}
			if(line_before_body_found == true){
				// this._insert_default_body_declarations(new_lines, shader_name)
				this._insert_lines(new_lines, body)
				line_before_body_found = false
			}

			let line_remove_required = false
			for(let line_to_remove of lines_to_remove){
				if(template_line.indexOf(line_to_remove) >= 0){
					line_remove_required = true
				}
			}
			if(!line_remove_required){
				new_lines.push(template_line)
			}

			if(template_line.indexOf(line_before_define) >= 0){ line_before_define_found = true }
			if(template_line.indexOf(line_before_body) >= 0){ line_before_body_found = true }

			// if(template_line.indexOf('// INSERT DEFINE') >= 0){
			// } else {
			// 	if(template_line.indexOf('// INSERT BODY') >= 0){
			// 		if(body.length > 0){
			// 			lodash_times(3, ()=>new_lines.push('	'))
			// 			body.forEach(body_line=>{
			// 				new_lines.push(body_line)
			// 			})
			// 			lodash_times(3, ()=>new_lines.push('	'))
			// 		}
			// 	} else {
			// 		if(template_line.indexOf('// TO REMOVE') < 0){
			// 			new_lines.push(template_line)
			// 		}
			// 	}
			// }
		}
		this._lines[shader_name] = new_lines
	}

	// protected _insert_default_body_declarations(new_lines, shader_name){
	// 	new_lines.push('float POLY_roughness = 1.0;')
	// }

	private _insert_lines(new_lines, lines_to_add){
		if(lines_to_add.length > 0){
			lodash_times(3, ()=>new_lines.push(''))
			lines_to_add.forEach(line_to_add=>{
				new_lines.push(line_to_add)
			})
			lodash_times(3, ()=>new_lines.push(''))
		}
	}

	protected expand_shader(shader_string){

		function parseIncludes( string ) {

			var pattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
			function replace( match, include ) {

				var replace = THREE.ShaderChunk[ include ];

				if ( replace === undefined ) {

					throw new Error( 'Can not resolve #include <' + include + '>' );

				}

				return parseIncludes( replace );
			}

			return string.replace( pattern, replace );

		}
		return parseIncludes(shader_string)
	}

	//
	//
	// GLTF EXPORT
	//
	//
	// static convert_material_to_gltf_supported(material: THREE.ShaderMaterial): THREE.Material{
	// 	const gltf_constructor = this.is_physical() ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial
	// 	const options = {}
	// 	this._match_uniform('color', options, material, 'diffuse')
	// 	this._match_uniform('map', options, material)
	// 	this._match_uniform('envMap', options, material)
	// 	this._match_uniform('envMapIntensity', options, material)
	// 	this._match_uniform('metalness', options, material)
	// 	this._match_uniform('roughness', options, material)
	// 	const gltf_material = new gltf_constructor(options)
	// 	return gltf_material
	// }
	static _match_uniform(name:string, options:object, material: THREE.ShaderMaterial, uniform_name?:string){
		uniform_name = uniform_name || name
		options[name] = material.uniforms[uniform_name].value
	}
}
