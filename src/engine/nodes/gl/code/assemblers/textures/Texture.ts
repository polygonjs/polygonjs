import {BaseGlShaderAssembler} from '../_Base';
import {IUniforms} from '../../../../../../core/geometry/Material';
// import {GlobalsTextureHandler} from '../../../../../Engine/Node/Gl/Assembler/Globals/Texture'
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
import TemplateDefault from '../../templates/textures/Default.frag.glsl';

import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';
import {OutputGlNode} from '../../../Output';
import {ParamType} from '../../../../../poly/ParamType';
import {GlobalsGlNode} from '../../../Globals';
import {TypedNamedConnectionPoint} from '../../../../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../../../../utils/connections/ConnectionPointType';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {UniformGLDefinition} from '../../../utils/GLDefinition';
// import {BaseGlNodeType} from '../../../_Base';

export class ShaderAssemblerTexture extends BaseGlShaderAssembler {
	private _uniforms: IUniforms | undefined;

	get _template_shader() {
		return {
			fragmentShader: TemplateDefault,
			vertexShader: undefined,
			uniforms: undefined,
		};
	}

	// async compile() {
	// 	await this.update_fragment_shader();
	// }

	fragment_shader() {
		return this._shaders_by_name.get(ShaderName.FRAGMENT);
	}
	// async get_shaders(){
	// 	await this.update_shaders()
	// 	return this._shaders_by_name
	// }

	uniforms() {
		return this._uniforms;
	}
	// _create_material() {
	// 	return undefined;
	// }

	async update_fragment_shader() {
		this._lines = new Map();
		this._shaders_by_name = new Map();
		for (let shader_name of this.shader_names) {
			if (shader_name == ShaderName.FRAGMENT) {
				const template = this._template_shader.fragmentShader;
				this._lines.set(shader_name, template.split('\n'));
			}
		}
		if (this._root_nodes.length > 0) {
			// this._output_node.set_assembler(this)
			await this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}

		this._uniforms = this._uniforms || {};
		this.add_uniforms(this._uniforms);
		// const new_uniforms = this.build_uniforms({}, this._uniforms || {});
		// this._uniforms = new_uniforms;
		// this._uniforms = this._uniforms || {};
		// for (let uniform_name of Object.keys(new_uniforms)) {
		// 	this._uniforms[uniform_name] = new_uniforms[uniform_name];
		// }
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shader_names) {
			const lines = this._lines.get(shader_name);
			if (lines) {
				this._shaders_by_name.set(shader_name, lines.join('\n'));
			}
		}

		// That's actually useless, since this doesn't make the texture recook
		const scene = this._gl_parent_node.scene;
		const id = this._gl_parent_node.graph_node_id;
		if (this.uniforms_time_dependent()) {
			if (this._uniforms) {
				scene.uniforms_controller.add_time_dependent_uniform_owner(id, this._uniforms as IUniformsWithTime);
			}
		} else {
			scene.uniforms_controller.remove_time_dependent_uniform_owner(id);
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	add_output_params(output_child: OutputGlNode) {
		output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
	}
	add_globals_params(globals_node: GlobalsGlNode) {
		globals_node.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint('gl_FragCoord', ConnectionPointType.VEC2),
			new TypedNamedConnectionPoint('time', ConnectionPointType.FLOAT),
			// new Connection.Vec2('resolution'),
		]);
	}

	//
	//
	// CONFIGS
	//
	//
	create_shader_configs() {
		return [new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [])];
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
	protected insert_define_after(shader_name: ShaderName) {
		return '// INSERT DEFINE';
	}
	protected insert_body_after(shader_name: ShaderName) {
		return '// INSERT BODY';
	}
	protected lines_to_remove(shader_name: ShaderName) {
		return ['// INSERT DEFINE', '// INSERT BODY'];
	}

	handle_gl_FragCoord(body_lines: string[], shader_name: ShaderName, var_name: string) {
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
	// 	export_node: BaseGlNodeType,
	// 	shader_name: ShaderName,
	// 	input_name: string,
	// 	input: BaseGlNodeType,
	// 	variable_name: string
	// ) {
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

	// 	if (input) {
	// 		const var_input = export_node.variable_for_input(input_name);
	// 		const new_var = ThreeToGl.vector3(var_input);
	// 		if (new_var) {
	// 			// const texture_variable = this._texture_allocations_controller.find_variable(
	// 			// 	export_node,
	// 			// 	shader_name,
	// 			// 	variable_name
	// 			// )
	// 			const texture_variable = this._texture_allocations_controller.variable(variable_name);
	// 			// if we are in the texture this variable is allocated to, we write it back
	// 			if (texture_variable.allocation().shader_name() == shader_name) {
	// 				const component = texture_variable.component();

	// 				const line = `gl_FragColor.${component} = ${new_var}`;
	// 				export_node.add_body_lines([line], shader_name);
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
	// 	}
	// 	const component = texture_variable.component()
	// 	const lines = [
	// 		`${gl_type} ${var_name} = texture2D( ${map_name}, particleUV ).${component}`,
	// 		`gl_FragColor.${component} = ${var_name}`
	// 	]
	// 	import_node.add_body_lines(lines, shader_name)
	// }

	set_node_lines_output(output_node: OutputGlNode, shaders_collection_controller: ShadersCollectionController) {
		const input_names = this.input_names_for_shader_name(
			output_node,
			shaders_collection_controller.current_shader_name
		);
		if (input_names) {
			for (let input_name of input_names) {
				const input = output_node.io.inputs.named_input(input_name);

				if (input) {
					const gl_var = output_node.variable_for_input(input_name);

					let body_line: string | undefined;
					if (input_name == 'color') {
						body_line = `diffuseColor.xyz = ${ThreeToGl.any(gl_var)}`;
					}
					if (input_name == 'alpha') {
						body_line = `diffuseColor.a = ${ThreeToGl.any(gl_var)}`;
					}
					if (body_line) {
						shaders_collection_controller.add_body_lines(output_node, [body_line]);
					}
					// this.add_export_body_line(
					// 	output_node,
					// 	shaders_collection_controller.current_shader_name,
					// 	input_name,
					// 	input,
					// 	variable_name
					// 	)
				} else {
					// position reads the default attribute position
					// or maybe there is no need?
					// if(input_name == 'position'){
					// 	this.globals_handler().read_attribute(output_node, 'vec3', 'position')
					// }
				}
			}
		}
	}
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
	set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController) {
		// const vertex_definitions = []
		// const fragment_definitions = []
		// const definitions = []
		// const vertex_body_lines = []
		// const fragment_body_lines = []
		const shader_name = shaders_collection_controller.current_shader_name;
		const shader_config = this.shader_config(shader_name);
		if (!shader_config) {
			return;
		}
		const body_lines: string[] = [];
		const definitions: UniformGLDefinition[] = [];

		// const shader_config = this.shader_config(shader_name)
		// const dependencies = shader_config.dependencies()

		// const definitions_by_shader_name = {}
		// definitions_by_shader_name[shader_name] = []
		// for(let dependency of dependencies){ definitions_by_shader_name[dependency] = [] }

		// const body_lines_by_shader_name = {}
		// body_lines_by_shader_name[shader_name] = []
		// for(let dependency of dependencies){ body_lines_by_shader_name[dependency] = [] }

		for (let output_name of globals_node.io.outputs.used_output_names()) {
			const var_name = globals_node.gl_var_name(output_name);
			// const globals_shader_name = shaders_collection_controller.current_shader_name;

			switch (output_name) {
				case 'time':
					definitions.push(new UniformGLDefinition(globals_node, ConnectionPointType.FLOAT, output_name));
					// vertex_definitions.push(definition)
					// fragment_definitions.push(definition)
					// definitions_by_shader_name[globals_node._shader_name].push(definition)

					body_lines.push(`float ${var_name} = ${output_name}`);
					// for(let dependency of dependencies){
					// 	definitions_by_shader_name[dependency].push(definition)
					// 	body_lines_by_shader_name[dependency].push(body_line)
					// }

					// vertex_body_lines.push(`float ${var_name} = ${output_name}`)
					// body_lines.push(body_line)
					this.set_uniforms_time_dependent();
					break;

				case 'gl_FragCoord':
					this.handle_gl_FragCoord(body_lines, shader_name, var_name);
					break;
				// default:
				// 	// this.add_import_body_line(globals_node, shader_name, output_name, output_name)
				// 	const named_output = globals_node.named_output_by_name(output_name)
				// 	const gl_type = named_output.gl_type()

				// 	const attrib_read = this.globals_handler().read_attribute(
				// 		globals_node,
				// 		gl_type,
				// 		output_name,
				// 		shader_name
				// 	)
				// 	body_line = `${gl_type} ${var_name} = ${attrib_read}`
				// 	body_lines.push(body_line)
				// 	//

				// 	// const map_name = `texture_${output_name}`
				// 	// definition = new Definition.Uniform(globals_node, 'sampler2D', map_name)
				// 	// definitions_by_shader_name[globals_node._shader_name].push(definition)

				// 	// body_line = `${gl_type} ${var_name} = texture2D( ${map_name}, particleUV ).xyz`

				// 	// // // if(dependencies.length == 0){
				// 	// body_lines.push(body_line)
				// 	// }
			}
		}

		shaders_collection_controller.add_definitions(globals_node, definitions, shader_name);
		shaders_collection_controller.add_body_lines(globals_node, body_lines);
		// this.set_vertex_definitions(vertex_definitions)
		// this.set_fragment_definitions(fragment_definitions)
		// for(let shader_name of Object.keys(definitions_by_shader_name)){
		// 	globals_node.add_definitions(definitions_by_shader_name[shader_name], shader_name)
		// }
		// for(let shader_name of Object.keys(body_lines_by_shader_name)){
		// 	globals_node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
		// }
		// this.add_definitions(definitions)
		// this.set_vertex_body_lines(vertex_body_lines)
		// this.set_fragment_body_lines(fragment_body_lines)

		// globals_node.add_body_lines(body_lines)
	}
}
