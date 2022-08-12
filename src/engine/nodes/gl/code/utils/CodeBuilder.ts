import {BaseGlNodeType} from '../../_Base';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {MapUtils} from '../../../../../core/MapUtils';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {GLDefinitionType, BaseGLDefinition} from '../../utils/GLDefinition';
import {TypedGLDefinitionCollection} from '../../utils/GLDefinitionCollection';
import {ParamConfigsController} from '../../../../nodes/utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './ShadersCollectionController';
import {CodeFormatter} from './CodeFormatter';

import {LineType} from './LineType';
import {GlParamConfig} from './GLParamConfig';
import {ParamType} from '../../../../poly/ParamType';
import {NodeContext} from '../../../../poly/NodeContext';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';
import {ArrayUtils} from '../../../../../core/ArrayUtils';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';

type RootNodesForShaderMethod = (shader_name: ShaderName, rootNodes: BaseGlNodeType[]) => BaseGlNodeType[];
// let nextId = 1;

export interface CodeBuilderSetCodeLinesOptions {
	otherFragmentShaderCollectionController?: ShadersCollectionController;
}

export class CodeBuilder {
	// private _id = (nextId += 1);
	private _param_configs_controller: ParamConfigsController<GlParamConfig<ParamType>> = new ParamConfigsController();
	private _param_configs_set_allowed: boolean = true;

	private _shadersCollectionController: ShadersCollectionController | undefined;
	private _lines: Map<ShaderName, Map<LineType, string[]>> = new Map();
	// _function_declared: Map<ShaderName, Map<string, boolean>> = new Map();

	constructor(
		private _nodeTraverser: TypedNodeTraverser<NodeContext.GL>,
		private _root_nodes_for_shader_method: RootNodesForShaderMethod,
		private _assembler: TypedAssembler<NodeContext.GL>
	) {}
	nodeTraverser() {
		return this._nodeTraverser;
	}
	shaderNames() {
		return this._nodeTraverser.shaderNames();
	}
	buildFromNodes(
		rootNodes: BaseGlNodeType[],
		paramNodes: BaseGlNodeType[],
		setCodeLinesOptions?: CodeBuilderSetCodeLinesOptions
	) {
		this._nodeTraverser.traverse(rootNodes);

		const nodesByShaderName: Map<ShaderName, BaseGlNodeType[]> = new Map();
		for (let shaderName of this.shaderNames()) {
			const nodes = this._nodeTraverser.nodesForShaderName(shaderName);
			nodesByShaderName.set(shaderName, nodes);
		}
		const sortedNodes = this._nodeTraverser.sortedNodes();
		for (let shaderName of this.shaderNames()) {
			const rootNodesForShader = this._root_nodes_for_shader_method(shaderName, rootNodes);

			for (let rootNode of rootNodesForShader) {
				MapUtils.pushOnArrayAtEntry(nodesByShaderName, shaderName, rootNode);
			}
		}

		// ensure nodes are not added if already present
		const sorted_node_ids: Map<CoreGraphNodeId, boolean> = new Map();
		for (let node of sortedNodes) {
			sorted_node_ids.set(node.graphNodeId(), true);
		}

		for (let rootNode of rootNodes) {
			if (!sorted_node_ids.get(rootNode.graphNodeId())) {
				sortedNodes.push(rootNode);
				sorted_node_ids.set(rootNode.graphNodeId(), true);
			}
		}
		for (let node of sortedNodes) {
			node.reset_code();
		}
		for (let node of paramNodes) {
			node.reset_code();
		}
		// for (let node of sorted_nodes) {
		// 	await node.params.eval_all();
		// }

		// const param_promises = sorted_nodes.map(node=>{
		// 	return node.eval_all_params()
		// })
		// await Promise.all(param_promises)

		this._shadersCollectionController = new ShadersCollectionController(
			this.shaderNames(),
			this.shaderNames()[0],
			this._assembler
		);
		this.reset();
		for (let shaderName of this.shaderNames()) {
			let nodes = nodesByShaderName.get(shaderName) || [];
			nodes = ArrayUtils.uniq(nodes);

			this._shadersCollectionController.setCurrentShaderName(shaderName);
			if (nodes) {
				for (let node of nodes) {
					node.setLines(this._shadersCollectionController);
				}
			}
		}
		// set param configs
		if (this._param_configs_set_allowed) {
			for (let param_node of paramNodes) {
				try {
					param_node.states.error.clear();
					param_node.setParamConfigs();
				} catch (err) {
					const message: string = (err as any).message || 'failed to create spare param';
					param_node.states.error.set(message);
					throw new Error(`${param_node.name()} cannot create spare parameter`);
				}
			}
			this.setParamConfigs(paramNodes);
		}

		// finalize
		this._setCodeLines(sortedNodes, setCodeLinesOptions);
	}

	shadersCollectionController() {
		return this._shadersCollectionController;
	}

	disallow_new_param_configs() {
		this._param_configs_set_allowed = false;
	}
	allow_new_param_configs() {
		this._param_configs_set_allowed = true;
	}

	private reset() {
		for (let shader_name of this.shaderNames()) {
			const lines_map = new Map();
			// for (let line_type of LINE_TYPES) {
			// 	lines_map.set(line_type, []);
			// }
			this._lines.set(shader_name, lines_map);
			// this._function_declared.set(shader_name, new Map());
		}
	}

	param_configs() {
		return this._param_configs_controller.list() || [];
	}
	lines(shader_name: ShaderName, line_type: LineType) {
		return this._lines.get(shader_name)?.get(line_type) || [];
	}
	all_lines() {
		return this._lines;
	}

	setParamConfigs(nodes: BaseGlNodeType[]) {
		this._param_configs_controller.reset();
		for (let node of nodes) {
			const param_configs = node.param_configs();
			if (param_configs) {
				for (let param_config of param_configs) {
					this._param_configs_controller.push(param_config);
				}
			}
		}
	}

	private _setCodeLines(nodes: BaseGlNodeType[], options?: CodeBuilderSetCodeLinesOptions) {
		for (let shaderName of this.shaderNames()) {
			const additionalDefinitions: BaseGLDefinition[] = [];
			if (shaderName == ShaderName.FRAGMENT) {
				if (this._shadersCollectionController && options && options.otherFragmentShaderCollectionController) {
					// for (let shaderName of options.otherShadersCollectionController.shaderNames()) {
					// this._linesControllerByShaderName.set(shaderName, new LinesController(shaderName));
					options.otherFragmentShaderCollectionController.traverseDefinitions(
						ShaderName.FRAGMENT,
						(definition: BaseGLDefinition) => {
							additionalDefinitions.push(definition);
						}
					);
					// }
				}
			}

			this._addCodeLines(nodes, shaderName, additionalDefinitions);
		}
	}

	private _addCodeLines(nodes: BaseGlNodeType[], shaderName: ShaderName, additionalDefinitions?: BaseGLDefinition[]) {
		this.addDefinitions(
			nodes,
			shaderName,
			GLDefinitionType.FUNCTION,
			LineType.FUNCTION_DECLARATION,
			additionalDefinitions
		);
		this.addDefinitions(nodes, shaderName, GLDefinitionType.UNIFORM, LineType.DEFINE, additionalDefinitions);
		this.addDefinitions(nodes, shaderName, GLDefinitionType.VARYING, LineType.DEFINE, additionalDefinitions);
		this.addDefinitions(nodes, shaderName, GLDefinitionType.ATTRIBUTE, LineType.DEFINE, additionalDefinitions);

		this.add_code_line_for_nodes_and_line_type(nodes, shaderName, LineType.BODY);
	}

	private addDefinitions(
		nodes: BaseGlNodeType[],
		shaderName: ShaderName,
		definitionType: GLDefinitionType,
		lineType: LineType,
		additionalDefinitions?: BaseGLDefinition[]
	) {
		if (!this._shadersCollectionController) {
			return;
		}
		const definitions: BaseGLDefinition[] = [];
		for (let node of nodes) {
			let nodeDefinitions = this._shadersCollectionController.definitions(shaderName, node);
			if (nodeDefinitions) {
				nodeDefinitions = nodeDefinitions.filter((d) => d.definition_type == definitionType);
				for (let definition of nodeDefinitions) {
					definitions.push(definition);
				}
			}
		}
		if (additionalDefinitions) {
			const filteredAdditionalDefinitions = additionalDefinitions.filter(
				(d) => d.definition_type == definitionType
			);
			for (let definition of filteredAdditionalDefinitions) {
				definitions.push(definition);
			}
		}

		if (definitions.length > 0) {
			const collection = new TypedGLDefinitionCollection<GLDefinitionType>(definitions);
			const uniqDefinitions = collection.uniq();
			if (collection.errored) {
				// TODO: handle error
				throw `code builder error: ${collection.error_message}`;
			}

			const definitions_by_node_id: Map<CoreGraphNodeId, BaseGLDefinition[]> = new Map();
			const nodeIds: Map<CoreGraphNodeId, boolean> = new Map();
			for (let definition of uniqDefinitions) {
				const nodeId = definition.node.graphNodeId();
				if (!nodeIds.has(nodeId)) {
					nodeIds.set(nodeId, true);
				}
				MapUtils.pushOnArrayAtEntry(definitions_by_node_id, nodeId, definition);
			}
			const lines_for_shader = this._lines.get(shaderName)!;
			nodeIds.forEach((_, nodeId) => {
				const definitions = definitions_by_node_id.get(nodeId);
				if (definitions) {
					const first_definition = definitions[0];

					if (first_definition) {
						const comment = CodeFormatter.node_comment(first_definition.node, lineType);
						MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, comment);

						for (let definition of definitions) {
							const line = CodeFormatter.line_wrap(first_definition.node, definition.line, lineType);
							MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, line);
						}
						const separator = CodeFormatter.post_line_separator(lineType);
						MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, separator);
					}
				}
			});
		}
	}
	add_code_line_for_nodes_and_line_type(nodes: BaseGlNodeType[], shader_name: ShaderName, line_type: LineType) {
		nodes = nodes.filter((node) => {
			if (this._shadersCollectionController) {
				const lines = this._shadersCollectionController.bodyLines(shader_name, node);
				return lines && lines.length > 0;
			}
		});

		var nodes_count = nodes.length;
		for (let i = 0; i < nodes_count; i++) {
			const is_last = i == nodes.length - 1;
			this.add_code_line_for_node_and_line_type(nodes[i], shader_name, line_type, is_last);
		}
	}
	add_code_line_for_node_and_line_type(
		node: BaseGlNodeType,
		shader_name: ShaderName,
		line_type: LineType,
		is_last: boolean
	): void {
		if (!this._shadersCollectionController) {
			return;
		}
		const lines = this._shadersCollectionController.bodyLines(shader_name, node);

		if (lines && lines.length > 0) {
			const lines_for_shader = this._lines.get(shader_name)!;
			const comment = CodeFormatter.node_comment(node, line_type);
			MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, comment);
			lines.forEach((line) => {
				line = CodeFormatter.line_wrap(node, line, line_type);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, line);
			});
			if (!(line_type == LineType.BODY && is_last)) {
				const separator = CodeFormatter.post_line_separator(line_type);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, separator);
			}
		}
	}
}
