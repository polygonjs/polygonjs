import {BaseJsNodeType} from '../../_Base';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {MapUtils} from '../../../../../core/MapUtils';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {JsDefinitionType, BaseJsDefinition, JsDefinitionTypeMap, TypedJsDefinition} from '../../utils/JsDefinition';
import {TypedJsDefinitionCollection} from '../../utils/JsDefinitionCollection';
import {ParamConfigsController} from '../../../../nodes/utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './ShadersCollectionController';
import {CodeFormatter} from './CodeFormatter';
import {LineType} from './LineType';
import {JsParamConfig} from './JsParamConfig';
import {ParamType} from '../../../../poly/ParamType';
import {NodeContext} from '../../../../poly/NodeContext';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';
import {ArrayUtils} from '../../../../../core/ArrayUtils';
import {BaseJsShaderAssembler} from '../assemblers/_Base';
// import {sanitizeName} from '../../../../../core/String';
import {ActorJsSopNode} from '../../../sop/ActorJs';
import {triggerableMethodCalls} from '../assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../../../core/SetUtils';
// import {connectedTriggerableNodes} from '../assemblers/actor/ActorAssemblerUtils';

type RootNodesForShaderMethod = (shader_name: ShaderName, rootNodes: BaseJsNodeType[]) => BaseJsNodeType[];
// let nextId = 1;

export interface CodeBuilderSetCodeLinesOptions {
	otherFragmentShaderCollectionController?: ShadersCollectionController;
	actor: {
		triggeringNodes: Set<BaseJsNodeType>;
		triggerableNodes: Set<BaseJsNodeType>;
		functionNode: ActorJsSopNode;
		// triggerNodesByType: Map<string, Set<BaseJsNodeType>>;
	};
}

export class CodeBuilder {
	// private _id = (nextId += 1);
	private _param_configs_controller: ParamConfigsController<JsParamConfig<ParamType>> = new ParamConfigsController();
	private _param_configs_set_allowed: boolean = true;

	private _shadersCollectionController: ShadersCollectionController | undefined;
	private _lines: Map<ShaderName, Map<LineType, string[]>> = new Map();
	// _function_declared: Map<ShaderName, Map<string, boolean>> = new Map();

	constructor(
		private _nodeTraverser: TypedNodeTraverser<NodeContext.JS>,
		private _rootNodesByShaderName: RootNodesForShaderMethod,
		private _assembler: BaseJsShaderAssembler
	) {}
	nodeTraverser() {
		return this._nodeTraverser;
	}
	shaderNames() {
		return this._nodeTraverser.shaderNames();
	}
	buildFromNodes(
		rootNodes: BaseJsNodeType[],
		paramNodes: BaseJsNodeType[],
		setCodeLinesOptions?: CodeBuilderSetCodeLinesOptions
	) {
		this._nodeTraverser.traverse(rootNodes);

		const nodesByShaderName: Map<ShaderName, BaseJsNodeType[]> = new Map();
		for (let shaderName of this.shaderNames()) {
			const nodes = this._nodeTraverser.nodesForShaderName(shaderName);
			nodesByShaderName.set(shaderName, nodes);
		}
		const sortedNodes = this._nodeTraverser.sortedNodes();
		for (let shaderName of this.shaderNames()) {
			const rootNodesForShader = this._rootNodesByShaderName(shaderName, rootNodes);

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
			if (setCodeLinesOptions?.actor) {
				const {triggeringNodes, triggerableNodes} = setCodeLinesOptions.actor;
				// triggering nodes
				for (let triggeringNode of triggeringNodes) {
					// const currentTriggerableNodes = new Set<BaseJsNodeType>();
					// connectedTriggerableNodes({
					// 	triggeringNodes: new Set([triggeringNode]),
					// 	triggerableNodes: currentTriggerableNodes,
					// 	recursive: false,
					// });
					// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) =>
					// 	nodeMethodName(n)
					// );
					// const triggerableMethodCalls = triggerableMethodNames
					// 	.map((methodName) => `this.${methodName}(${0})`)
					// 	.join('\n');
					const _triggerableMethodCalls = triggerableMethodCalls(triggeringNode);
					triggeringNode.setTriggeringLines(this._shadersCollectionController, _triggerableMethodCalls);
				}
				// triggerable nodes
				for (let triggerableNode of triggerableNodes) {
					triggerableNode.setTriggerableLines(this._shadersCollectionController);
				}
			}

			//
			//
			// create triggerable methods
			//
			//
			// if (setCodeLinesOptions) {
			// 	const shadersCollectionController = this._shadersCollectionController;
			// 	shadersCollectionController.withAllowActionLines(() => {
			// 		const {functionNode, triggerNodesByType} = setCodeLinesOptions;
			// 		const nodeMethodName = (node: BaseJsNodeType) =>
			// 			sanitizeName(node.path().replace(functionNode.path(), ''));

			// 		// const triggerableFunctionLines: string[] = [];
			// 		triggerNodesByType.forEach((triggerNodes, nodeType) => {
			// 			const triggerableNodes: Set<BaseJsNodeType> = new Set();
			// 			connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});
			// 			for (let node of triggerableNodes) {
			// 				// const shadersCollectionController = new ShadersCollectionController(
			// 				// 	this.shaderNames(),
			// 				// 	this.shaderNames()[0],
			// 				// 	this
			// 				// );
			// 				// shadersCollectionController.setAllowActionLines(true);
			// 				node.setLines(shadersCollectionController);
			// 				const bodyLines = shadersCollectionController.bodyLines(ShaderName.FRAGMENT, node);
			// 				console.log(bodyLines);
			// 				if (bodyLines) {
			// 					const methodName = nodeMethodName(node);
			// 					const wrappedLines = `${methodName}(){
			// 	${bodyLines.join('\n')}
			// }`;
			// 					// triggerableFunctionLines.push(wrappedLines);
			// 					console.log({wrappedLines});
			// 					shadersCollectionController._addBodyLines(node, [wrappedLines], shaderName);
			// 				}
			// 			}
			// 		});
			// 	});
			// }

			// trigger node lines
			// const triggerNodes = setCodeLinesOptions?.actor.triggerNodes;
			// if (triggerNodes) {
			// 	for (let triggerNode of triggerNodes) {
			// 		triggerNode.addConstructorInitFunctionLines(this._shadersCollectionController);
			// 	}
			// }
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

	setParamConfigs(nodes: BaseJsNodeType[]) {
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

	private _setCodeLines(nodes: BaseJsNodeType[], options?: CodeBuilderSetCodeLinesOptions) {
		for (let shaderName of this.shaderNames()) {
			const additionalDefinitions: BaseJsDefinition[] = [];
			if (shaderName == ShaderName.FRAGMENT) {
				if (this._shadersCollectionController && options && options.otherFragmentShaderCollectionController) {
					// for (let shaderName of options.otherShadersCollectionController.shaderNames()) {
					// this._linesControllerByShaderName.set(shaderName, new LinesController(shaderName));
					options.otherFragmentShaderCollectionController.traverseDefinitions(
						ShaderName.FRAGMENT,
						(definition: BaseJsDefinition) => {
							additionalDefinitions.push(definition);
						}
					);
					// }
				}
			}

			this._addCodeLines(nodes, shaderName, additionalDefinitions, options);
		}
	}

	private _addCodeLines(
		nodes: BaseJsNodeType[],
		shaderName: ShaderName,
		additionalDefinitions?: BaseJsDefinition[],
		options?: CodeBuilderSetCodeLinesOptions
	) {
		// this.addDefinitions(nodes, shaderName, JsDefinitionType.PRECISION, LineType.DEFINE, additionalDefinitions);
		// this.addDefinitions(
		// 	nodes,
		// 	shaderName,
		// 	JsDefinitionType.FUNCTION,
		// 	LineType.FUNCTION_DECLARATION,
		// 	additionalDefinitions
		// );
		// this.addDefinitions(nodes, shaderName, JsDefinitionType.UNIFORM, LineType.DEFINE, additionalDefinitions);
		// this.addDefinitions(nodes, shaderName, JsDefinitionType.VARYING, LineType.DEFINE, additionalDefinitions);
		// this.addDefinitions(nodes, shaderName, JsDefinitionType.ATTRIBUTE, LineType.DEFINE, additionalDefinitions);
		// this.addDefinitions(nodes, shaderName, JsDefinitionType.INIT, LineType.DEFINE, additionalDefinitions);
		const allNodes =
			options && options.actor
				? nodes
						.concat(SetUtils.toArray(options.actor.triggeringNodes))
						.concat(SetUtils.toArray(options.actor.triggerableNodes))
				: nodes;

		this.addDefinitions(nodes, shaderName, JsDefinitionType.LOCAL_FUNCTION, LineType.DEFINE, additionalDefinitions);
		this.addDefinitions(allNodes, shaderName, JsDefinitionType.COMPUTED, LineType.MEMBER, additionalDefinitions);
		this.addDefinitions(nodes, shaderName, JsDefinitionType.CONSTANT, LineType.MEMBER, additionalDefinitions);
		this.addDefinitions(allNodes, shaderName, JsDefinitionType.REF, LineType.MEMBER, additionalDefinitions);

		// console.log(
		// 	'triggerNodes',
		// 	options?.triggerNodes?.map((n) => n.name())
		// );

		// const initFunctionNodes = nodes.concat(options?.actor.triggerNodes || []);
		this.addDefinitions(
			allNodes,
			shaderName,
			JsDefinitionType.INIT_FUNCTION,
			LineType.CONSTRUCTOR,
			additionalDefinitions
		);
		this.addDefinitions(nodes, shaderName, JsDefinitionType.WATCH, LineType.CONSTRUCTOR, additionalDefinitions);
		if (options?.actor.triggeringNodes) {
			this.addDefinitions(
				SetUtils.toArray(options.actor.triggeringNodes),
				shaderName,
				JsDefinitionType.TRIGGERING,
				LineType.BODY,
				additionalDefinitions
			);
		}
		if (options?.actor.triggerableNodes) {
			this.addDefinitions(
				SetUtils.toArray(options.actor.triggerableNodes),
				shaderName,
				JsDefinitionType.TRIGGERABLE,
				LineType.BODY,
				additionalDefinitions
			);
		}

		this.add_code_line_for_nodes_and_line_type(allNodes, shaderName, LineType.BODY);
	}

	private addDefinitions(
		nodes: BaseJsNodeType[],
		shaderName: ShaderName,
		definitionType: JsDefinitionType,
		lineType: LineType,
		additionalDefinitions?: BaseJsDefinition[]
	) {
		if (!this._shadersCollectionController) {
			return;
		}
		const definitions: TypedJsDefinition<JsDefinitionType>[] = [];
		for (let node of nodes) {
			let nodeDefinitions = this._shadersCollectionController.definitions(shaderName, node);
			if (nodeDefinitions) {
				nodeDefinitions = nodeDefinitions.filter((d) => d.definitionType() == definitionType);
				for (let definition of nodeDefinitions) {
					definitions.push(definition);
				}
			}
		}
		if (additionalDefinitions) {
			const filteredAdditionalDefinitions = additionalDefinitions.filter(
				(d) => d.definitionType() == definitionType
			);
			for (let definition of filteredAdditionalDefinitions) {
				definitions.push(definition);
			}
		}
		if (definitions.length == 0) {
			return;
		}

		const collection = new TypedJsDefinitionCollection<JsDefinitionType>(definitions);
		const uniqDefinitions = collection.uniq();
		if (collection.errored) {
			// TODO: handle error
			throw `code builder error: ${collection.error_message}`;
		}

		const definitions_by_node_id: Map<CoreGraphNodeId, BaseJsDefinition[]> = new Map();
		const nodeIds: Map<CoreGraphNodeId, boolean> = new Map();
		for (let definition of uniqDefinitions) {
			const nodeId = definition.node().graphNodeId();
			if (!nodeIds.has(nodeId)) {
				nodeIds.set(nodeId, true);
			}
			MapUtils.pushOnArrayAtEntry(definitions_by_node_id, nodeId, definition);
		}
		const lines_for_shader = this._lines.get(shaderName)!;

		// gather
		const definitionClass = JsDefinitionTypeMap[definitionType];
		definitionClass.gather(definitions, lines_for_shader, lineType);

		// process definition for each node
		nodeIds.forEach((_, nodeId) => {
			const definitions = definitions_by_node_id.get(nodeId);
			if (definitions) {
				const first_definition = definitions[0];

				if (first_definition) {
					const comment = CodeFormatter.nodeComment(first_definition.node(), lineType);
					MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, comment);

					for (let definition of definitions) {
						const line = CodeFormatter.lineWrap(first_definition.node(), definition.line(), lineType);
						MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, line);
					}
					const separator = CodeFormatter.post_line_separator(lineType);
					MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, separator);
				}
			}
		});
	}
	add_code_line_for_nodes_and_line_type(nodes: BaseJsNodeType[], shader_name: ShaderName, line_type: LineType) {
		nodes = nodes.filter((node) => {
			if (this._shadersCollectionController) {
				const lines = this._shadersCollectionController.bodyLines(shader_name, node);
				return lines && lines.length > 0;
			}
		});

		var nodesCount = nodes.length;
		for (let i = 0; i < nodesCount; i++) {
			const isLast = i == nodes.length - 1;
			this.add_code_line_for_node_and_line_type(nodes[i], shader_name, line_type, isLast);
		}
	}
	add_code_line_for_node_and_line_type(
		node: BaseJsNodeType,
		shader_name: ShaderName,
		line_type: LineType,
		isLast: boolean
	): void {
		if (!this._shadersCollectionController) {
			return;
		}
		const lines = this._shadersCollectionController.bodyLines(shader_name, node);

		if (lines && lines.length > 0) {
			const lines_for_shader = this._lines.get(shader_name)!;
			const comment = CodeFormatter.nodeComment(node, line_type);
			MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, comment);
			lines.forEach((line) => {
				line = CodeFormatter.lineWrap(node, line, line_type);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, line);
			});
			if (!(line_type == LineType.BODY && isLast)) {
				const separator = CodeFormatter.post_line_separator(line_type);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, line_type, separator);
			}
		}
	}
}
