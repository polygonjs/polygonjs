import {BaseJsNodeType} from '../../_Base';
import {TypedNodeTraverser} from '../../../utils/shaders/NodeTraverser';
import {MapUtils} from '../../../../../core/MapUtils';
import {JsFunctionName} from '../../../utils/shaders/ShaderName';
import {JsDefinitionType, BaseJsDefinition, JsDefinitionTypeMap, TypedJsDefinition} from '../../utils/JsDefinition';
import {TypedJsDefinitionCollection} from '../../utils/JsDefinitionCollection';
import {ParamConfigsController} from '../../../../nodes/utils/code/controllers/ParamConfigsController';
import {JsLinesCollectionController} from './JsLinesCollectionController';
import {CodeFormatter} from './CodeFormatter';
import {LineType} from './LineType';
import {JsParamConfig} from './JsParamConfig';
import {ParamType} from '../../../../poly/ParamType';
import {NodeContext} from '../../../../poly/NodeContext';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';
import {arrayUniq} from '../../../../../core/ArrayUtils';
import {BaseJsShaderAssembler} from '../assemblers/_Base';
// import {sanitizeName} from '../../../../../core/String';
import {triggerableMethodCalls} from '../assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../../../core/SetUtils';
import {ActorBuilderNode} from '../../../../scene/utils/ActorsManager';
import {JsType} from '../../../../poly/registers/nodes/types/Js';
import {CodeJsNode} from '../../Code';
// import {connectedTriggerableNodes} from '../assemblers/actor/ActorAssemblerUtils';

type RootNodesForJsFunctionMethod = (shader_name: JsFunctionName, rootNodes: BaseJsNodeType[]) => BaseJsNodeType[];
// let nextId = 1;

export interface CodeBuilderSetCodeLinesOptions {
	otherFragmentShaderCollectionController?: JsLinesCollectionController;
	actor: {
		triggeringNodes: Set<BaseJsNodeType>;
		triggerableNodes: Set<BaseJsNodeType>;
		functionNode: ActorBuilderNode;
		// triggerNodesByType: Map<string, Set<BaseJsNodeType>>;
	};
}

export class JsCodeBuilder {
	// private _id = (nextId += 1);
	private _param_configs_controller: ParamConfigsController<JsParamConfig<ParamType>> = new ParamConfigsController();
	private _param_configs_set_allowed: boolean = true;

	private _shadersCollectionController: JsLinesCollectionController | undefined;
	private _lines: Map<JsFunctionName, Map<LineType, string[]>> = new Map();
	// _function_declared: Map<ShaderName, Map<string, boolean>> = new Map();

	constructor(
		private _nodeTraverser: TypedNodeTraverser<NodeContext.JS>,
		private _rootNodesByShaderName: RootNodesForJsFunctionMethod,
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

		const nodesByShaderName: Map<JsFunctionName, BaseJsNodeType[]> = new Map();
		for (const shaderName of this.shaderNames()) {
			const nodes = this._nodeTraverser.nodesForShaderName(shaderName);
			nodesByShaderName.set(shaderName, nodes);
		}
		const sortedNodes = this._nodeTraverser.sortedNodes();
		for (const shaderName of this.shaderNames()) {
			const rootNodesForShader = this._rootNodesByShaderName(shaderName, rootNodes);

			for (const rootNode of rootNodesForShader) {
				MapUtils.pushOnArrayAtEntry(nodesByShaderName, shaderName, rootNode);
			}
		}

		// ensure nodes are not added if already present
		const sorted_node_ids: Map<CoreGraphNodeId, boolean> = new Map();
		for (const node of sortedNodes) {
			sorted_node_ids.set(node.graphNodeId(), true);
		}

		for (const rootNode of rootNodes) {
			if (!sorted_node_ids.get(rootNode.graphNodeId())) {
				sortedNodes.push(rootNode);
				sorted_node_ids.set(rootNode.graphNodeId(), true);
			}
		}
		for (const node of sortedNodes) {
			node.reset_code();
		}
		for (const node of paramNodes) {
			node.reset_code();
		}

		// compile code nodes
		// compiling code nodes here cannot work,
		// as this may recreate new connections on the node,
		// which will in turn retrigger this function,
		// which easily becomes an infinite loop
		const nodesToBeComputed = [...sortedNodes];
		if (setCodeLinesOptions?.actor) {
			const {triggeringNodes, triggerableNodes} = setCodeLinesOptions.actor;
			nodesToBeComputed.push(...triggeringNodes, ...triggerableNodes);
		}
		const codeNodes = nodesToBeComputed.filter((n) => n.type() == JsType.CODE) as CodeJsNode[];
		for (const node of codeNodes) {
			if (!node.compiled()) {
				// try {
				// node.functionNode()?.dirtyController.setForbiddenTriggerNodes([node]);
				const functionNode = node.functionNode();
				if (functionNode) {
					node.setForbiddenTriggerNodes(functionNode);
				}
				node.compile({triggerFunctionNode: false});
				node.clearForbiddenTriggerNodes();
				// node.functionNode()?.dirtyController.setForbiddenTriggerNodes([]);
				if (node.states.error.active() || !node.compiled()) {
					const message = `failed to generated code (see node ${node.path()})`;
					// node.functionNode()?.states.error.set(message);
					// this._setCodeLines([], setCodeLinesOptions);
					throw new Error(message);
					// return;
				} // else {
				//	console.log('OK');
				//}
				// } catch (err) {
				// 	console.log('NOT OK', node.path(), node.states.error.active());
				// 	node.states.error.set(`failed to generated code`);
				// 	node.functionNode()?.states.error.set(`node ${node.path()} failed to generated code`);
				// }
			}
		}

		// const param_promises = sorted_nodes.map(node=>{
		// 	return node.eval_all_params()
		// })
		// await Promise.all(param_promises)

		this._shadersCollectionController = new JsLinesCollectionController(
			this.shaderNames(),
			this.shaderNames()[0],
			this._assembler
		);

		this.reset();
		for (const shaderName of this.shaderNames()) {
			let nodes = nodesByShaderName.get(shaderName) || [];
			nodes = arrayUniq(nodes);
			this._shadersCollectionController.setCurrentShaderName(shaderName);
			if (nodes) {
				for (const node of nodes) {
					node.setLines(this._shadersCollectionController);
				}
			}
			if (setCodeLinesOptions?.actor) {
				const {triggeringNodes, triggerableNodes} = setCodeLinesOptions.actor;
				// triggering nodes
				for (const triggeringNode of triggeringNodes) {
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
				for (const triggerableNode of triggerableNodes) {
					try {
						triggerableNode.setTriggerableLines(this._shadersCollectionController);
					} catch (err) {
						triggerableNode.states.error.set(`failed to generate code`);
						throw new Error(`node ${triggerableNode.path()} failed to generated code`);
					}
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
			for (const param_node of paramNodes) {
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
	lines(shader_name: JsFunctionName, line_type: LineType) {
		return this._lines.get(shader_name)?.get(line_type) || [];
	}
	all_lines() {
		return this._lines;
	}

	setParamConfigs(nodes: BaseJsNodeType[]) {
		this._param_configs_controller.reset();
		for (const node of nodes) {
			const param_configs = node.param_configs();
			if (param_configs) {
				for (const param_config of param_configs) {
					this._param_configs_controller.push(param_config);
				}
			}
		}
	}

	private _setCodeLines(nodes: BaseJsNodeType[], options?: CodeBuilderSetCodeLinesOptions) {
		for (const shaderName of this.shaderNames()) {
			const additionalDefinitions: BaseJsDefinition[] = [];
			// if (shaderName == JsFunctionName.MAIN) {
			if (this._shadersCollectionController && options && options.otherFragmentShaderCollectionController) {
				// for (const shaderName of options.otherShadersCollectionController.shaderNames()) {
				// this._linesControllerByShaderName.set(shaderName, new LinesController(shaderName));
				options.otherFragmentShaderCollectionController.traverseDefinitions(
					shaderName,
					(definition: BaseJsDefinition) => {
						additionalDefinitions.push(definition);
					}
				);
				// }
			}
			// }

			this._addCodeLines(nodes, shaderName, additionalDefinitions, options);
		}
	}

	private _addCodeLines(
		nodes: BaseJsNodeType[],
		shaderName: JsFunctionName,
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
						.concat(SetUtils.toArray(options.actor.triggeringNodes, []))
						.concat(SetUtils.toArray(options.actor.triggerableNodes, []))
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
		this.addDefinitions(allNodes, shaderName, JsDefinitionType.WATCH, LineType.CONSTRUCTOR, additionalDefinitions);
		if (options?.actor.triggeringNodes) {
			this.addDefinitions(
				// we currently add all nodes here,
				// so that nodes which have an intersection output
				// can have their triggering method added,
				// even if only the intersection output is used
				allNodes, //SetUtils.toArray(options.actor.triggeringNodes),
				shaderName,
				JsDefinitionType.TRIGGERING,
				LineType.BODY,
				additionalDefinitions
			);
		}
		if (options?.actor.triggerableNodes) {
			this.addDefinitions(
				SetUtils.toArray(options.actor.triggerableNodes, []),
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
		shaderName: JsFunctionName,
		definitionType: JsDefinitionType,
		lineType: LineType,
		additionalDefinitions?: BaseJsDefinition[]
	) {
		if (!this._shadersCollectionController) {
			return;
		}
		const definitions: TypedJsDefinition<JsDefinitionType>[] = [];
		for (const node of nodes) {
			let nodeDefinitions = this._shadersCollectionController.definitions(shaderName, node);
			if (nodeDefinitions) {
				nodeDefinitions = nodeDefinitions.filter((d) => d.definitionType() == definitionType);
				for (const definition of nodeDefinitions) {
					definitions.push(definition);
				}
			}
		}
		if (additionalDefinitions) {
			const filteredAdditionalDefinitions = additionalDefinitions.filter(
				(d) => d.definitionType() == definitionType
			);
			for (const definition of filteredAdditionalDefinitions) {
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
		for (const definition of uniqDefinitions) {
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

					for (const definition of definitions) {
						const line = CodeFormatter.lineWrap(first_definition.node(), definition.line(), lineType);
						MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, line);
					}
					const separator = CodeFormatter.post_line_separator(lineType);
					MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, separator);
				}
			}
		});
	}
	add_code_line_for_nodes_and_line_type(nodes: BaseJsNodeType[], shaderName: JsFunctionName, lineType: LineType) {
		nodes = nodes.filter((node) => {
			if (this._shadersCollectionController) {
				const lines = this._shadersCollectionController.bodyLines(shaderName, node);
				return lines && lines.length > 0;
			}
		});

		var nodesCount = nodes.length;
		for (let i = 0; i < nodesCount; i++) {
			const isLast = i == nodes.length - 1;
			this.add_code_line_for_node_and_line_type(nodes[i], shaderName, lineType, isLast);
		}
	}
	add_code_line_for_node_and_line_type(
		node: BaseJsNodeType,
		shaderName: JsFunctionName,
		lineType: LineType,
		isLast: boolean
	): void {
		if (!this._shadersCollectionController) {
			return;
		}
		const lines = this._shadersCollectionController.bodyLines(shaderName, node);

		if (lines && lines.length > 0) {
			const lines_for_shader = this._lines.get(shaderName)!;
			const comment = CodeFormatter.nodeComment(node, lineType);
			MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, comment);
			lines.forEach((line) => {
				line = CodeFormatter.lineWrap(node, line, lineType);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, line);
			});
			if (!(lineType == LineType.BODY && isLast)) {
				const separator = CodeFormatter.post_line_separator(lineType);
				MapUtils.pushOnArrayAtEntry(lines_for_shader, lineType, separator);
			}
		}
	}
}
