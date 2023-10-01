import {BaseGlShaderAssembler} from '../_Base';
import TemplateDefault from '../../templates/cloth/Default.glsl';
import {AttributeGlNode} from '../../../Attribute';
import {TextureAllocationsController} from '../../utils/TextureAllocationsController';
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
import {BaseGlNodeType} from '../../../_Base';
import {GlobalsGlNode} from '../../../Globals';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
// import {UniformGLDefinition} from '../../../utils/GLDefinition';
import {GlobalsTextureHandler} from '../../globals/Texture';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {SubnetOutputGlNode} from '../../../SubnetOutput';
import {GlNodeTraverser} from '../../../../utils/shaders/GlNodeTraverser';

export class ShaderAssemblerCloth extends BaseGlShaderAssembler {
	private _textureAllocationsController: TextureAllocationsController | undefined;

	override templateShader() {
		return undefined;
	}
	protected override _template_shader_for_shader_name(shader_name: ShaderName) {
		return TemplateDefault;
	}
	// async get_shaders(){
	// 	await this.update_shaders()
	// 	return this._shaders_by_name
	// }

	override compile() {
		this.setup_shader_names_and_variables();
		this._updateShaders();
	}

	override rootNodesByShaderName(shader_name: ShaderName, rootNodes: BaseGlNodeType[]): BaseGlNodeType[] {
		// return this._root_nodes
		const list = [];
		for (const node of rootNodes) {
			switch (node.type()) {
				case SubnetOutputGlNode.type():
				case OutputGlNode.type(): {
					list.push(node);
					break;
				}
				// 	list.push(node);
				// 	break;
				// }
				case AttributeGlNode.type(): {
					const attrib_name = (node as AttributeGlNode).attributeName();
					const variable = this._textureAllocationsController?.variable(attrib_name);
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
	// override leaf_nodes_by_shader_name(shader_name: ShaderName): BaseGlNodeType[] {
	// 	const list = [];
	// 	for (let node of this._leaf_nodes) {
	// 		switch (node.type()) {
	// 			case GlobalsGlNode.type(): {
	// 				list.push(node);
	// 				break;
	// 			}
	// 			case AttributeGlNode.type(): {
	// 				const attrib_name: string = (node as AttributeGlNode).attributeName();
	// 				const variable = this._textureAllocationsController?.variable(attrib_name);
	// 				if (variable && variable.allocation()) {
	// 					const allocation_shader_name = variable.allocation()?.shaderName();
	// 					if (allocation_shader_name == shader_name) {
	// 						list.push(node);
	// 					}
	// 				}
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	return list;
	// }

	setup_shader_names_and_variables() {
		// here we need 2 traversers:
		// 1: the first one is shallow and does not traverse children, just like the materials
		// 2: the second one does traverse the children,
		// and is necessary to find the attribute nodes that may be inside subnets
		// so that we can allocate the texture variables

		const node_traverser_shallow = new GlNodeTraverser(
			this.currentGlParentNode(),
			this.shaderNames(),
			(root_node, shader_name) => {
				return this.inputNamesForShaderName(root_node, shader_name);
			}
		);
		const node_traverser_deep = new GlNodeTraverser(
			this.currentGlParentNode(),
			this.shaderNames(),
			(root_node, shader_name) => {
				return this.inputNamesForShaderName(root_node, shader_name);
			},
			{traverseChildren: true}
		);
		this._leaf_nodes = node_traverser_shallow.leavesFromNodes(this._root_nodes);
		const leafNodesForTextureAllocations = node_traverser_deep.leavesFromNodes(this._root_nodes);

		// for (let node of this._root_nodes) {
		// 	await node.params.eval_all();
		// }
		// for (let node of this._leaf_nodes) {
		// 	await node.params.eval_all();
		// }

		this._textureAllocationsController = new TextureAllocationsController();
		this._textureAllocationsController.allocateConnectionsFromRootNodes(
			this._root_nodes,
			leafNodesForTextureAllocations
		);

		// const globalsHandler = new GlobalsTextureHandler()
		// this.setAssemblerGlobalsHandler(globalsHandler)
		if (this.globalsHandler()) {
			((<unknown>this.globalsHandler()) as GlobalsTextureHandler)?.set_texture_allocations_controller(
				this._textureAllocationsController
			);
		}

		this._reset_shader_configs();
	}
	private _updateShaders() {
		this._shaders_by_name.clear();
		this._lines.clear();
		for (const shader_name of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shader_name);
			this._lines.set(shader_name, template.split('\n'));
		}
		if (this._root_nodes.length > 0) {
			// the code builder needs to be reset here,
			// as otherwise it will not know that the shader names may have changed
			this._resetCodeBuilder();
			this.buildCodeFromNodes(this._root_nodes);

			this._buildLines();
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (const shader_name of this.shaderNames()) {
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
	override add_output_inputs(output_child: OutputGlNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			// new GlConnectionPoint('velocity', GlConnectionPointType.VEC3),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsGlNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			// new GlConnectionPoint('velocity', GlConnectionPointType.VEC3),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
			new GlConnectionPoint('timeDelta', GlConnectionPointType.FLOAT),
		]);
	}
	override allow_attribute_exports() {
		return false;
	}

	textureAllocationsController() {
		return (this._textureAllocationsController =
			this._textureAllocationsController || new TextureAllocationsController());
	}

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return this._textureAllocationsController?.createShaderConfigs() || [];
		// [
		// 	new ShaderConfig('position', ['position'], []),
		// 	// new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		// ]
	}
	override create_variable_configs() {
		return [
			// new VariableConfig('position', {
			// 	default: 'vec3( position )',
			// 	prefix: 'vec3 transformed = '
			// }),
		];
	}
	override shaderNames(): ShaderName[] {
		return this.textureAllocationsController().shaderNames() || [];
	}
	override inputNamesForShaderName(root_node: BaseGlNodeType, shader_name: ShaderName) {
		return this.textureAllocationsController().inputNamesForShaderName(root_node, shader_name) || [];
		// return this.shader_config(shader_name).input_names()
	}

	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected override insertDefineAfter(shader_name: ShaderName) {
		return '// INSERT DEFINE';
	}
	protected override insertBodyAfter(shader_name: ShaderName) {
		return '// INSERT BODY';
	}
	protected override linesToRemove(shader_name: ShaderName) {
		return ['// INSERT DEFINE', '// INSERT BODY'];
	}

	//
	//
	// TEMPLATE CODE REPLACEMENT
	//
	//
	add_export_body_line(
		exportNode: BaseGlNodeType,
		inputName: string,
		input: BaseGlNodeType,
		variableName: string,
		linesController: ShadersCollectionController
	) {
		if (input) {
			const var_input = exportNode.variableForInput(inputName);
			const new_var = ThreeToGl.vector3(var_input);
			if (new_var) {
				const texture_variable = this.textureAllocationsController().variable(variableName);

				// if we are in the texture this variable is allocated to, we write it back
				const shader_name = linesController.currentShaderName();
				if (texture_variable && texture_variable.allocation()?.shaderName() == shader_name) {
					const component = texture_variable.component();

					const line = `${inputName}.${component} = ${new_var}`;
					linesController.addBodyLines(exportNode, [line], shader_name);
				}
			}
		}
	}

	override set_node_lines_output(outputNode: BaseGlNodeType, linesController: ShadersCollectionController) {
		const shaderName = linesController.currentShaderName();
		const inputNames = this.textureAllocationsController().inputNamesForShaderName(outputNode, shaderName);
		if (inputNames) {
			for (let inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);

				if (input) {
					const variable_name = inputName;
					this.add_export_body_line(outputNode, inputName, input, variable_name, linesController);
				} else {
					// position reads the default attribute position
					// or maybe there is no need?
					// if(input_name == 'position'){
					// 	this.globalsHandler().read_attribute(output_node, 'vec3', 'position')
					// }
				}
			}
		}
	}
	override setNodeLinesAttribute(attributeNode: AttributeGlNode, linesController: ShadersCollectionController) {
		if (attributeNode.isImporting()) {
			const gl_type = attributeNode.glType();
			const attribute_name = attributeNode.attributeName();
			const new_value = this.globalsHandler()?.readAttribute(
				attributeNode,
				gl_type,
				attribute_name,
				linesController
			);
			const var_name = attributeNode.glVarName(attributeNode.outputName());
			const body_line = `${gl_type} ${var_name} = ${new_value}`;
			linesController.addBodyLines(attributeNode, [body_line]);

			// re-export to ensure it is available on next frame
			const texture_variable = this.textureAllocationsController().variable(attribute_name);
			const shader_name = linesController.currentShaderName();
			if (texture_variable && texture_variable.allocation()?.shaderName() == shader_name) {
				const variable = this.textureAllocationsController().variable(attribute_name);
				if (variable) {
					const component = variable.component();
					const body_line = `gl_FragColor.${component} = ${var_name}`;
					linesController.addBodyLines(attributeNode, [body_line]);
				}
			}

			// this.add_import_body_line(
			// 	attribute_node,
			// 	shader_name,
			// 	Attribute.output_name(),
			// 	attribute_node.attribute_name()
			// 	)
		}
		if (attributeNode.isExporting()) {
			const input = attributeNode.connected_input_node();
			if (input) {
				const variable_name = attributeNode.attributeName();

				this.add_export_body_line(
					attributeNode,
					attributeNode.inputName(),
					input,
					variable_name,
					linesController
				);
			}
		}
	}
	override set_node_lines_globals(globals_node: GlobalsGlNode, linesController: ShadersCollectionController) {
		for (let outputName of globals_node.io.outputs.used_output_names()) {
			switch (outputName) {
				case 'time': {
					this._handleGlobalsUniform(globals_node, outputName, linesController);
					break;
				}
				case 'timeDelta': {
					this._handleGlobalsUniform(globals_node, outputName, linesController);
					break;
				}
				case 'position': {
					this._handleGlobalsPosition(globals_node, outputName, linesController);
					break;
				}
				default: {
					this._handleGlobalsPosition(globals_node, outputName, linesController);
					break;
				}
			}
		}
	}

	private _handleGlobalsUniform(
		globalsNode: GlobalsGlNode,
		outputName: string,
		linesController: ShadersCollectionController
	) {
		// no need to add time and timeDelta as they are already present
		// const definition = new UniformGLDefinition(globalsNode, GlConnectionPointType.FLOAT, outputName);
		// linesController.addDefinitions(globalsNode, [definition]);

		const varName = globalsNode.glVarName(outputName);
		const bodyLine = `float ${varName} = ${outputName}`;
		linesController.addBodyLines(globalsNode, [bodyLine]);
		this.setUniformsTimeDependent();
	}

	private _handleGlobalsPosition(
		globalsNode: GlobalsGlNode,
		outputName: string,
		linesController: ShadersCollectionController
	) {
		const output_connection_point = globalsNode.io.outputs.namedOutputConnectionPointsByName(outputName);
		if (output_connection_point) {
			const glType = output_connection_point.type();

			const attribRead = 'position'; //this.globalsHandler()?.readAttribute(globalsNode, glType, outputName, linesController);
			if (attribRead) {
				const varName = globalsNode.glVarName(outputName);
				const bodyLine = `${glType} ${varName} = ${attribRead}`;
				linesController.addBodyLines(globalsNode, [bodyLine]);
			}
		}
	}
}
