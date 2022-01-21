import {BaseGlShaderAssembler} from '../_Base';
// import {GlobalsTextureHandler} from '../../Assembler/Globals/Texture';

import TemplateDefault from '../../templates/particles/Default.glsl';
// import TemplatePosition from './Template/Particle/Position.glsl'
// import TemplateVelocity from './Template/Particle/Velocity.glsl'
// import TemplateAcceleration from './Template/Particle/Acceleration.glsl'

// import {ShaderConfig} from './Config/ShaderConfig';
// import {VariableConfig} from './Config/VariableConfig';
// import {ShaderName, LineType} from '../../../../../Engine/Node/Gl/Assembler/Util/CodeBuilder';
import {AttributeGlNode} from '../../../Attribute';
import {TextureAllocationsController} from '../../utils/TextureAllocationsController';
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
import {BaseGlNodeType} from '../../../_Base';
import {GlobalsGlNode} from '../../../Globals';
import {TypedNodeTraverser} from '../../../../utils/shaders/NodeTraverser';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
import {UniformGLDefinition} from '../../../utils/GLDefinition';
import {GlobalsTextureHandler} from '../../globals/Texture';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {NodeContext} from '../../../../../poly/NodeContext';

export class ShaderAssemblerParticles extends BaseGlShaderAssembler {
	private _texture_allocations_controller: TextureAllocationsController | undefined;

	templateShader() {
		return undefined;
	}
	protected _template_shader_for_shader_name(shader_name: ShaderName) {
		return TemplateDefault;
	}
	// async get_shaders(){
	// 	await this.update_shaders()
	// 	return this._shaders_by_name
	// }

	compile() {
		this.setup_shader_names_and_variables();
		this.update_shaders();
	}

	root_nodes_by_shader_name(shader_name: ShaderName): BaseGlNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of this._root_nodes) {
			switch (node.type()) {
				case OutputGlNode.type(): {
					list.push(node);
					break;
				}
				case AttributeGlNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler?
					const attrib_name = (node as AttributeGlNode).attributeName();
					const variable = this._texture_allocations_controller?.variable(attrib_name);
					if (variable && variable.allocation()) {
						const allocation_shader_name = variable.allocation()?.shaderName();
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
			switch (node.type()) {
				case GlobalsGlNode.type(): {
					list.push(node);
					break;
				}
				case AttributeGlNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler? AND especially since there is no way to assign it?
					const attrib_name: string = (node as AttributeGlNode).attributeName();
					const variable = this._texture_allocations_controller?.variable(attrib_name);
					if (variable && variable.allocation()) {
						const allocation_shader_name = variable.allocation()?.shaderName();
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

	setup_shader_names_and_variables() {
		const node_traverser = new TypedNodeTraverser<NodeContext.GL>(
			this.currentGlParentNode(),
			this.shaderNames(),
			(root_node, shader_name) => {
				return this.input_names_for_shader_name(root_node, shader_name);
			}
		);
		this._leaf_nodes = node_traverser.leaves_from_nodes(this._root_nodes);

		// for (let node of this._root_nodes) {
		// 	await node.params.eval_all();
		// }
		// for (let node of this._leaf_nodes) {
		// 	await node.params.eval_all();
		// }

		this._texture_allocations_controller = new TextureAllocationsController();
		this._texture_allocations_controller.allocateConnectionsFromRootNodes(this._root_nodes, this._leaf_nodes);

		// const globals_handler = new GlobalsTextureHandler()
		// this.set_assembler_globals_handler(globals_handler)
		if (this.globals_handler) {
			((<unknown>this.globals_handler) as GlobalsTextureHandler)?.set_texture_allocations_controller(
				this._texture_allocations_controller
			);
		}

		this._reset_shader_configs();
	}
	update_shaders() {
		this._shaders_by_name.clear();
		this._lines.clear();
		for (let shader_name of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shader_name);
			this._lines.set(shader_name, template.split('\n'));
		}
		if (this._root_nodes.length > 0) {
			// the code builder needs to be reset here,
			// as otherwise it will not know that the shader names may have changed
			this._resetCodeBuilder();
			this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shaderNames()) {
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
	add_output_inputs(output_child: OutputGlNode) {
		// output_child.add_param(ParamType.VECTOR3, 'position', [0, 0, 0]);
		// output_child.add_param(ParamType.VECTOR3, 'velocity', [0, 0, 0]);
		output_child.io.inputs.setNamedInputConnectionPoints([
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('velocity', GlConnectionPointType.VEC3),
		]);
	}
	add_globals_outputs(globals_node: GlobalsGlNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('velocity', GlConnectionPointType.VEC3),
			// new TypedNamedConnectionPoint('acceleration', ConnectionPointType.VEC3),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
		]);
	}
	allow_attribute_exports() {
		return true;
	}

	textureAllocationsController() {
		return (this._texture_allocations_controller =
			this._texture_allocations_controller || new TextureAllocationsController());
	}

	//
	//
	// CONFIGS
	//
	//
	create_shader_configs() {
		return this._texture_allocations_controller?.createShaderConfigs() || [];
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
	shaderNames(): ShaderName[] {
		return this.textureAllocationsController().shaderNames() || [];
	}
	input_names_for_shader_name(root_node: BaseGlNodeType, shader_name: ShaderName) {
		return this.textureAllocationsController().inputNamesForShaderName(root_node, shader_name) || [];
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
		input_name: string,
		input: BaseGlNodeType,
		variable_name: string,
		shaders_collection_controller: ShadersCollectionController
	) {
		if (input) {
			const var_input = export_node.variableForInput(input_name);
			const new_var = ThreeToGl.vector3(var_input);
			if (new_var) {
				const texture_variable = this.textureAllocationsController().variable(variable_name);

				// if we are in the texture this variable is allocated to, we write it back
				const shader_name = shaders_collection_controller.current_shader_name;
				if (texture_variable && texture_variable.allocation()?.shaderName() == shader_name) {
					const component = texture_variable.component();

					const line = `gl_FragColor.${component} = ${new_var}`;
					shaders_collection_controller.addBodyLines(export_node, [line], shader_name);
				}
			}
		}
	}

	set_node_lines_output(output_node: BaseGlNodeType, shaders_collection_controller: ShadersCollectionController) {
		const shader_name = shaders_collection_controller.current_shader_name;
		const input_names = this.textureAllocationsController().inputNamesForShaderName(output_node, shader_name);
		if (input_names) {
			for (let input_name of input_names) {
				const input = output_node.io.inputs.named_input(input_name);

				if (input) {
					const variable_name = input_name;
					this.add_export_body_line(
						output_node,
						input_name,
						input,
						variable_name,
						shaders_collection_controller
					);
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
	set_node_lines_attribute(
		attribute_node: AttributeGlNode,
		shaders_collection_controller: ShadersCollectionController
	) {
		if (attribute_node.isImporting()) {
			const gl_type = attribute_node.glType();
			const attribute_name = attribute_node.attributeName();
			const new_value = this.globals_handler?.read_attribute(
				attribute_node,
				gl_type,
				attribute_name,
				shaders_collection_controller
			);
			const var_name = attribute_node.glVarName(attribute_node.outputName());
			const body_line = `${gl_type} ${var_name} = ${new_value}`;
			shaders_collection_controller.addBodyLines(attribute_node, [body_line]);

			// re-export to ensure it is available on next frame
			const texture_variable = this.textureAllocationsController().variable(attribute_name);
			const shader_name = shaders_collection_controller.current_shader_name;
			if (texture_variable && texture_variable.allocation()?.shaderName() == shader_name) {
				const variable = this.textureAllocationsController().variable(attribute_name);
				if (variable) {
					const component = variable.component();
					const body_line = `gl_FragColor.${component} = ${var_name}`;
					shaders_collection_controller.addBodyLines(attribute_node, [body_line]);
				}
			}

			// this.add_import_body_line(
			// 	attribute_node,
			// 	shader_name,
			// 	Attribute.output_name(),
			// 	attribute_node.attribute_name()
			// 	)
		}
		if (attribute_node.isExporting()) {
			const input = attribute_node.connected_input_node();
			if (input) {
				const variable_name = attribute_node.attributeName();

				this.add_export_body_line(
					attribute_node,
					attribute_node.inputName(),
					input,
					variable_name,
					shaders_collection_controller
				);
			}
		}
	}
	set_node_lines_globals(globals_node: GlobalsGlNode, shaders_collection_controller: ShadersCollectionController) {
		for (let output_name of globals_node.io.outputs.used_output_names()) {
			switch (output_name) {
				case 'time':
					this._handle_globals_time(globals_node, output_name, shaders_collection_controller);
					break;
				default:
					this._handle_globals_default(globals_node, output_name, shaders_collection_controller);
			}
		}
	}

	private _handle_globals_time(
		globals_node: GlobalsGlNode,
		output_name: string,
		shaders_collection_controller: ShadersCollectionController
	) {
		const definition = new UniformGLDefinition(globals_node, GlConnectionPointType.FLOAT, output_name);
		shaders_collection_controller.addDefinitions(globals_node, [definition]);

		const var_name = globals_node.glVarName(output_name);
		const body_line = `float ${var_name} = ${output_name}`;
		shaders_collection_controller.addBodyLines(globals_node, [body_line]);
		this.setUniformsTimeDependent();
	}

	private _handle_globals_default(
		globals_node: GlobalsGlNode,
		output_name: string,
		shaders_collection_controller: ShadersCollectionController
	) {
		const output_connection_point = globals_node.io.outputs.namedOutputConnectionPointsByName(output_name);
		if (output_connection_point) {
			const gl_type = output_connection_point.type();

			const attrib_read = this.globals_handler?.read_attribute(
				globals_node,
				gl_type,
				output_name,
				shaders_collection_controller
			);
			if (attrib_read) {
				const var_name = globals_node.glVarName(output_name);
				const body_line = `${gl_type} ${var_name} = ${attrib_read}`;
				shaders_collection_controller.addBodyLines(globals_node, [body_line]);
			}
		}
	}
}
