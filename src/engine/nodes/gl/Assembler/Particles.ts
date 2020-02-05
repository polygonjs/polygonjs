import {BaseGlShaderAssembler} from './_Base';
// import {GlobalsTextureHandler} from 'src/engine/nodes/gl/Assembler/Globals/Texture';

import TemplateDefault from './Template/Particle/Default.glsl';
// import TemplatePosition from './Template/Particle/Position.glsl'
// import TemplateVelocity from './Template/Particle/Velocity.glsl'
// import TemplateAcceleration from './Template/Particle/Acceleration.glsl'

// import {ShaderConfig} from './Config/ShaderConfig';
// import {VariableConfig} from './Config/VariableConfig';
// import {ShaderName, LineType} from 'src/Engine/Node/Gl/Assembler/Util/CodeBuilder';
import {AttributeGlNode} from '../Attribute';
import {TextureAllocationsController} from './Util/TextureAllocationsController';
import {ThreeToGl} from 'src/core/ThreeToGl';
import {BaseGlNodeType} from '../_Base';
import {GlobalsGlNode} from '../Globals';
import {TypedNodeTraverser} from '../../utils/shaders/NodeTraverser';
import {ShaderName} from '../../utils/shaders/ShaderName';
import {OutputGlNode} from '../Output';
import {ParamType} from 'src/engine/poly/ParamType';
import {TypedNamedConnectionPoint} from '../../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../../utils/connections/ConnectionPointType';
import {BaseGLDefinition, UniformGLDefinition} from '../utils/GLDefinition';
import {MapUtils} from 'src/core/MapUtils';
import {GlobalsTextureHandler} from './Globals/Texture';

export class ShaderAssemblerParticles extends BaseGlShaderAssembler {
	private _texture_allocations_controller: TextureAllocationsController | undefined;

	get _template_shader() {
		return undefined;
	}
	protected _template_shader_for_shader_name(shader_name: ShaderName) {
		return TemplateDefault;
	}
	// async get_shaders(){
	// 	await this.update_shaders()
	// 	return this._shaders_by_name
	// }

	async compile() {
		await this.setup_shader_names_and_variables();
		await this.update_shaders();
	}

	root_nodes_by_shader_name(shader_name: ShaderName): BaseGlNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of this._root_nodes) {
			switch (node.type) {
				case 'output': {
					list.push(node);
					break;
				}
				case 'attribute': {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler?
					const attrib_name = (node as AttributeGlNode).attribute_name;
					const variable = this._texture_allocations_controller?.variable(attrib_name);
					if (variable && variable.allocation) {
						const allocation_shader_name = variable.allocation.shader_name;
						if (allocation_shader_name == shader_name) {
							list.push(node);
						}
					}
					break;
				}
			}
		}
		return list;
	}
	leaf_nodes_by_shader_name(shader_name: ShaderName): BaseGlNodeType[] {
		const list = [];
		for (let node of this._leaf_nodes) {
			switch (node.type) {
				case 'globals': {
					list.push(node);
					break;
				}
				case 'attribute': {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler? AND especially since there is no way to assign it?
					const attrib_name: string = (node as AttributeGlNode).attribute_name;
					const variable = this._texture_allocations_controller?.variable(attrib_name);
					if (variable && variable.allocation) {
						const allocation_shader_name = variable.allocation.shader_name;
						if (allocation_shader_name == shader_name) {
							list.push(node);
						}
					}
					break;
				}
			}
		}
		return list;
	}
	async setup_shader_names_and_variables() {
		const node_traverser = new TypedNodeTraverser<BaseGlNodeType>(this, this._gl_parent_node);
		this._leaf_nodes = node_traverser.leaves_from_nodes(this._root_nodes);

		for (let node of this._root_nodes) {
			await node.params.eval_all();
		}
		for (let node of this._leaf_nodes) {
			await node.params.eval_all();
		}

		// console.log("creatig _texture_allocations_controller")
		this._texture_allocations_controller = new TextureAllocationsController();
		this._texture_allocations_controller.allocate_connections_from_root_nodes(this._root_nodes, this._leaf_nodes);

		// const globals_handler = new GlobalsTextureHandler()
		// this.set_assembler_globals_handler(globals_handler)
		(this.globals_handler as GlobalsTextureHandler)?.set_texture_allocations_controller(
			this._texture_allocations_controller
		);

		// console.log("this._texture_allocations_controller", this._texture_allocations_controller)
		this._reset_shader_configs();
	}
	async update_shaders() {
		this._shaders_by_name = new Map();
		this._lines = new Map();
		for (let shader_name of this.shader_names) {
			const template = this._template_shader_for_shader_name(shader_name);
			this._lines.set(shader_name, template.split('\n'));
		}
		if (this._root_nodes.length > 0) {
			// this._output_node.set_assembler(this)
			await this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shader_names) {
			const lines = this._lines.get(shader_name);
			if (lines) {
				this._shaders_by_name.set(shader_name, lines.join('\n'));
			}
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	add_output_params(output_child: OutputGlNode) {
		output_child.add_param(ParamType.VECTOR3, 'position', [0, 0, 0]);
		output_child.add_param(ParamType.VECTOR3, 'velocity', [0, 0, 0]);
		output_child.add_param(ParamType.VECTOR3, 'acceleration', [0, 0, 0]);
	}
	add_globals_params(globals_node: GlobalsGlNode) {
		globals_node.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint('position', ConnectionPointType.VEC3),
			new TypedNamedConnectionPoint('velocity', ConnectionPointType.VEC3),
			new TypedNamedConnectionPoint('acceleration', ConnectionPointType.VEC3),
			new TypedNamedConnectionPoint('frame', ConnectionPointType.FLOAT),
		]);
	}
	allow_attribute_exports() {
		return true;
	}

	get texture_allocations_controller() {
		return (this._texture_allocations_controller =
			this._texture_allocations_controller || new TextureAllocationsController());
	}

	//
	//
	// CONFIGS
	//
	//
	create_shader_configs() {
		return this._texture_allocations_controller?.create_shader_configs() || [];
		// [
		// 	new ShaderConfig('position', ['position'], []),
		// 	// new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		// ]
	}
	create_variable_configs() {
		return [
			// new VariableConfig('position', {
			// 	default: 'vec3( position )',
			// 	prefix: 'vec3 transformed = '
			// }),
		];
	}
	get shader_names(): ShaderName[] {
		return this.texture_allocations_controller.shader_names() || [];
	}
	input_names_for_shader_name(root_node: BaseGlNodeType, shader_name: ShaderName) {
		return this.texture_allocations_controller.input_names_for_shader_name(root_node, shader_name) || [];
		// return this.shader_config(shader_name).input_names()
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

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//
	add_export_body_line(
		export_node: BaseGlNodeType,
		shader_name: ShaderName,
		input_name: string,
		input: BaseGlNodeType,
		variable_name: string
	) {
		// console.log("add_export_body_line", export_node, shader_name, input_name)

		// let input
		// let variable_name
		// if(export_node.type() == 'output'){
		// 	input = export_node.named_input(input_name)
		// 	variable_name = input_name
		// } else {
		// 	// if attribute
		// 	input = export_node.connected_named_input()
		// 	variable_name = export_node.attribute_name()
		// }

		if (input) {
			const var_input = export_node.variable_for_input(input_name);
			const new_var = ThreeToGl.vector3(var_input);
			if (new_var) {
				// const texture_variable = this._texture_allocations_controller.find_variable(
				// 	export_node,
				// 	shader_name,
				// 	variable_name
				// )
				const texture_variable = this.texture_allocations_controller.variable(variable_name);
				if (!texture_variable) {
					console.log(export_node.full_path(), shader_name, variable_name, input);
				}
				// if we are in the texture this variable is allocated to, we write it back
				if (texture_variable && texture_variable.allocation?.shader_name == shader_name) {
					const component = texture_variable.component;

					const line = `gl_FragColor.${component} = ${new_var}`;
					export_node.add_body_lines([line], shader_name);
				}
			}
		}
	}
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

	set_node_lines_output(output_node: BaseGlNodeType, shader_name: ShaderName) {
		const input_names = this.texture_allocations_controller.input_names_for_shader_name(output_node, shader_name);
		output_node.set_body_lines([], shader_name);
		if (input_names) {
			for (let input_name of input_names) {
				const input = output_node.io.inputs.named_input(input_name);
				const variable_name = input_name;

				if (input) {
					this.add_export_body_line(output_node, shader_name, input_name, input, variable_name);
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
	set_node_lines_attribute(attribute_node: AttributeGlNode, shader_name: ShaderName) {
		if (attribute_node.is_importing) {
			const gl_type = attribute_node.gl_type();
			const attribute_name = attribute_node.attribute_name;
			const new_value = this.globals_handler?.read_attribute(
				attribute_node,
				gl_type,
				attribute_name,
				shader_name
			);
			const var_name = attribute_node.gl_var_name(attribute_node.output_name);
			const body_line = `${gl_type} ${var_name} = ${new_value}`;
			attribute_node.add_body_lines([body_line]);

			// re-export to ensure it is available on next frame
			const texture_variable = this.texture_allocations_controller.variable(attribute_name);
			if (texture_variable && texture_variable.allocation?.shader_name == shader_name) {
				const variable = this.texture_allocations_controller.variable(attribute_name);
				if (variable) {
					const component = variable.component;
					attribute_node.add_body_lines([`gl_FragColor.${component} = ${var_name}`]);
				}
			}

			// this.add_import_body_line(
			// 	attribute_node,
			// 	shader_name,
			// 	Attribute.output_name(),
			// 	attribute_node.attribute_name()
			// 	)
		}
		if (attribute_node.is_exporting) {
			const input = attribute_node.connected_input_node();
			if (input) {
				const variable_name = attribute_node.attribute_name;

				this.add_export_body_line(attribute_node, shader_name, attribute_node.input_name, input, variable_name);
			}
		}
	}
	set_node_lines_globals(globals_node: GlobalsGlNode, shader_name: ShaderName) {
		// const vertex_definitions = [];
		// const fragment_definitions = [];
		// const definitions = [];
		// const vertex_body_lines = []
		// const fragment_body_lines = [];
		const body_lines: string[] = [];

		// const shader_config = this.shader_config(shader_name)
		// const dependencies = shader_config.dependencies()

		const definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]> = new Map();
		definitions_by_shader_name.set(shader_name, []);
		// for(let dependency of dependencies){ definitions_by_shader_name[dependency] = [] }

		// const body_lines_by_shader_name = {}
		// body_lines_by_shader_name[shader_name] = []
		// for(let dependency of dependencies){ body_lines_by_shader_name[dependency] = [] }

		// console.log("this.used_output_names()", this.used_output_names())
		let definition: BaseGLDefinition;
		let body_line: string;
		for (let output_name of globals_node.io.outputs.used_output_names()) {
			const var_name = globals_node.gl_var_name(output_name);

			switch (output_name) {
				case 'frame':
					definition = new UniformGLDefinition(globals_node, ConnectionPointType.FLOAT, output_name);
					// vertex_definitions.push(definition)
					// fragment_definitions.push(definition)
					MapUtils.push_on_array_at_entry(definitions_by_shader_name, globals_node.shader_name, definition);
					// definitions_by_shader_name[globals_node._shader_name].push(definition);

					body_line = `float ${var_name} = ${output_name}`;
					// for(let dependency of dependencies){
					// 	definitions_by_shader_name[dependency].push(definition)
					// 	body_lines_by_shader_name[dependency].push(body_line)
					// }

					// vertex_body_lines.push(`float ${var_name} = ${output_name}`)
					body_lines.push(body_line);
					this.set_frame_dependent();
					break;

				default:
					// console.log("add_import_body_line", globals_node, shader_name)
					// this.add_import_body_line(globals_node, shader_name, output_name, output_name)
					const output_connection_point = globals_node.io.outputs.named_output_connection_points_by_name(
						output_name
					);
					if (output_connection_point) {
						const gl_type = output_connection_point.type;

						const attrib_read = this.globals_handler?.read_attribute(
							globals_node,
							gl_type,
							output_name,
							shader_name
						);
						body_line = `${gl_type} ${var_name} = ${attrib_read}`;
						body_lines.push(body_line);
					}
				//

				// const map_name = `texture_${output_name}`
				// definition = new Definition.Uniform(globals_node, 'sampler2D', map_name)
				// definitions_by_shader_name[globals_node._shader_name].push(definition)

				// body_line = `${gl_type} ${var_name} = texture2D( ${map_name}, particleUV ).xyz`

				// // // if(dependencies.length == 0){
				// body_lines.push(body_line)
				// }
			}
		}
		// this.set_vertex_definitions(vertex_definitions)
		// this.set_fragment_definitions(fragment_definitions)
		definitions_by_shader_name.forEach((definitions, shader_name) => {
			globals_node.add_definitions(definitions, shader_name);
		});
		// for(let shader_name of Object.keys(body_lines_by_shader_name)){
		// 	globals_node.add_body_lines(body_lines_by_shader_name[shader_name], shader_name)
		// }
		// this.add_definitions(definitions)
		// this.set_vertex_body_lines(vertex_body_lines)
		// this.set_fragment_body_lines(fragment_body_lines)

		globals_node.add_body_lines(body_lines);
	}
}
