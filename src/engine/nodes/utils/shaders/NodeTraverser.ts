import {BaseGlConnectionPoint} from './../io/connections/Gl';
import {CoreGraph} from '../../../../core/graph/CoreGraph';
import {MapUtils} from '../../../../core/MapUtils';
import {ShaderNameByContextMap} from './ShaderName';
import {TypedNode} from '../../_Base';
import {NodeContext, BaseNodeByContextMap, NetworkChildNodeType} from '../../../poly/NodeContext';
// import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {ArrayUtils} from '../../../../core/ArrayUtils';

// type NumberByString = Map<string, number>;
type NumberByCoreGraphNodeId = Map<CoreGraphNodeId, number>;
// type BaseNodeTypeByString = Map<string, BaseNodeType>;
// type BooleanByString = Map<string, boolean>;
type BooleanByCoreGraphNodeId = Map<CoreGraphNodeId, boolean>;
type BooleanByStringByShaderName<NC extends NodeContext> = Map<ShaderNameByContextMap[NC], BooleanByCoreGraphNodeId>;
type StringArrayByString = Map<CoreGraphNodeId, CoreGraphNodeId[]>;
type InputNamesByShaderNameMethod<NC extends NodeContext> = (
	root_node: BaseNodeByContextMap[NC],
	shader_name: ShaderNameByContextMap[NC]
) => string[];

interface NodeTraverserOptions {
	traverseChildren?: boolean;
}
export class TypedNodeTraverser<NC extends NodeContext> {
	protected _leaves_graph_id: BooleanByStringByShaderName<NC> = new Map();
	protected _graph_ids_by_shader_name: BooleanByStringByShaderName<NC> = new Map();
	private _outputs_by_graph_id: StringArrayByString = new Map();
	private _depth_by_graph_id: NumberByCoreGraphNodeId = new Map();
	private _graph_id_by_depth: Map<number, CoreGraphNodeId[]> = new Map();
	protected _graph: CoreGraph;
	protected _shaderName!: ShaderNameByContextMap[NC];
	// private _subnets_by_id: BaseNodeTypeByString = new Map();

	constructor(
		private _parent_node: TypedNode<NC, any>,
		private _shader_names: ShaderNameByContextMap[NC][],
		private _inputNamesForShaderNameMethod: InputNamesByShaderNameMethod<NC>,
		private _options?: NodeTraverserOptions
	) {
		this._graph = this._parent_node.scene().graph;
	}
	private _traverseChildren() {
		return this._options?.traverseChildren || false;
	}

	private reset() {
		this._leaves_graph_id.clear();
		this._graph_ids_by_shader_name.clear();
		this._outputs_by_graph_id.clear();
		this._depth_by_graph_id.clear();
		this._graph_id_by_depth.clear();
		// this._subnets_by_id.clear();

		this._shader_names.forEach((shader_name) => {
			this._graph_ids_by_shader_name.set(shader_name, new Map());
		});
	}

	shaderNames() {
		return this._shader_names;
	}
	inputNamesForShaderName(root_node: BaseNodeByContextMap[NC], shader_name: ShaderNameByContextMap[NC]) {
		return this._inputNamesForShaderNameMethod(root_node, shader_name);
	}

	traverse(rootNodes: BaseNodeByContextMap[NC][]) {
		this.reset();

		for (let shaderName of this.shaderNames()) {
			this._leaves_graph_id.set(shaderName, new Map());
		}

		for (let shaderName of this.shaderNames()) {
			this._shaderName = shaderName;
			for (let rootNode of rootNodes) {
				this._findLeavesFromRootNode(rootNode);
				this._setNodesDepth();
			}
		}

		// graph_ids.forEach((graph_id) => {
		this._depth_by_graph_id.forEach((depth: number, graph_id: CoreGraphNodeId) => {
			if (depth != null) {
				// this._graph_id_by_depth.set(depth, this._graph_id_by_depth.get(depth) || []);
				// this._graph_id_by_depth.get(depth)?.push(graph_id);
				MapUtils.pushOnArrayAtEntry(this._graph_id_by_depth, depth, graph_id);
			}
		});
	}

	nodesForShaderName(shaderName: ShaderNameByContextMap[NC]) {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((value: CoreGraphNodeId[], key: number) => {
			depths.push(key);
		});
		depths.sort((a, b) => a - b);
		const nodes: BaseNodeByContextMap[NC][] = [];
		const node_id_used_state: Map<CoreGraphNodeId, boolean> = new Map();
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				graph_ids_for_depth.forEach((graph_id: CoreGraphNodeId) => {
					const is_present = this._graph_ids_by_shader_name.get(shaderName)?.get(graph_id);
					if (is_present) {
						const node = this._graph.nodeFromId(graph_id) as BaseNodeByContextMap[NC];

						this._addNodesWithChildren(node, node_id_used_state, nodes);
					}
				});
			}
		});
		return nodes;
	}
	sortedNodes() {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((ids: CoreGraphNodeId[], depth: number) => {
			depths.push(depth);
		});
		depths.sort((a, b) => a - b);
		const nodes: BaseNodeByContextMap[NC][] = [];
		const node_id_used_state: Map<CoreGraphNodeId, boolean> = new Map();
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				for (let graph_id of graph_ids_for_depth) {
					const node = this._graph.nodeFromId(graph_id) as BaseNodeByContextMap[NC];
					if (node) {
						this._addNodesWithChildren(node, node_id_used_state, nodes);
					}
				}
			}
		});

		return nodes;
	}
	private _addNodesWithChildren(
		node: BaseNodeByContextMap[NC],
		node_id_used_state: Map<CoreGraphNodeId, boolean>,
		accumulated_nodes: BaseNodeByContextMap[NC][]
		// shader_name?: ShaderName
	) {
		if (!node_id_used_state.get(node.graphNodeId())) {
			accumulated_nodes.push(node);
			node_id_used_state.set(node.graphNodeId(), true);
		}
		// if (node.type() == NetworkChildNodeType.INPUT) {
		// 	console.log('_addNodesWithChildren', node);
		// 	const parent = node.parent();
		// 	if (parent) {
		// 		const nodes_with_same_parent_as_subnet_input = this._sortedNodesForShaderNameForParent(
		// 			parent,
		// 			shader_name
		// 		);
		// 		for (let child_node of nodes_with_same_parent_as_subnet_input) {
		// 			if (child_node.graphNodeId() != node.graphNodeId()) {
		// 				this._addNodesWithChildren(child_node, node_id_used_state, accumulated_nodes, shader_name);
		// 			}
		// 		}
		// 	}
		// }
	}

	// private _sortedNodesForShaderNameForParent(parent: BaseNodeType, shader_name?: ShaderName) {
	// 	const depths: number[] = [];
	// 	this._graph_id_by_depth.forEach((value: CoreGraphNodeId[], key: number) => {
	// 		depths.push(key);
	// 	});
	// 	depths.sort((a, b) => a - b);
	// 	const nodes: BaseNodeByContextMap[NC][] = [];
	// 	depths.forEach((depth) => {
	// 		const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
	// 		if (graph_ids_for_depth) {
	// 			graph_ids_for_depth.forEach((graph_id: CoreGraphNodeId) => {
	// 				const is_present = shader_name
	// 					? this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id)
	// 					: true;
	// 				if (is_present) {
	// 					const node = this._graph.nodeFromId(graph_id) as BaseNodeByContextMap[NC];
	// 					if (node.parent() == parent) {
	// 						nodes.push(node);
	// 					}
	// 				}
	// 			});
	// 		}
	// 	});
	// 	const first_node = nodes[0];
	// 	if (parent.context() == first_node.context()) {
	// 		nodes.push(parent as BaseNodeByContextMap[NC]);
	// 	}

	// 	return nodes;
	// }

	private _findLeavesFromRootNode(rootNode: BaseNodeByContextMap[NC]) {
		this._graph_ids_by_shader_name.get(this._shaderName)?.set(rootNode.graphNodeId(), true);

		// if rootNode is a subnet, traverse its children output nodes instead
		if (rootNode.childrenAllowed() && this._traverseChildren()) {
			const outputNode = rootNode.childrenController?.outputNode() as BaseNodeByContextMap[NC] | undefined;
			if (outputNode) {
				this._findLeavesFromRootNode(outputNode);
				return;
			}
		}

		//
		const inputNames = this.inputNamesForShaderName(rootNode, this._shaderName);
		if (inputNames) {
			for (let inputName of inputNames) {
				const input = rootNode.io.inputs.named_input(inputName) as BaseNodeByContextMap[NC];
				if (input) {
					MapUtils.pushOnArrayAtEntry(this._outputs_by_graph_id, input.graphNodeId(), rootNode.graphNodeId());
					this._findLeaves(input);
				}
			}
		}

		this._outputs_by_graph_id.forEach((outputs: CoreGraphNodeId[], graph_id: CoreGraphNodeId) => {
			this._outputs_by_graph_id.set(graph_id, ArrayUtils.uniq(outputs));
		});
	}
	private _blockedInputNames: Map<string, string[]> | undefined;
	setBlockedInputNames(nodeType: string, inputNames: string[]) {
		this._blockedInputNames = this._blockedInputNames || new Map();
		this._blockedInputNames.set(nodeType, inputNames);
	}

	protected _findLeaves(node: BaseNodeByContextMap[NC]) {
		this._graph_ids_by_shader_name.get(this._shaderName)?.set(node.graphNodeId(), true);

		const inputs = this._findInputs(node) as BaseNodeByContextMap[NC][];
		const compactInputs: BaseNodeByContextMap[NC][] = ArrayUtils.compact(inputs);
		const inputGraphIds = ArrayUtils.uniq(compactInputs.map((n) => n.graphNodeId()));
		const uniqueInputs = inputGraphIds.map((graph_id) =>
			this._graph.nodeFromId(graph_id)
		) as BaseNodeByContextMap[NC][];

		if (uniqueInputs.length > 0) {
			for (let input of uniqueInputs) {
				MapUtils.pushOnArrayAtEntry(this._outputs_by_graph_id, input.graphNodeId(), node.graphNodeId());

				this._findLeaves(input);
			}
		} else {
			this._leaves_graph_id.get(this._shaderName)!.set(node.graphNodeId(), true);
		}
	}
	getNodeInputs(node: BaseNodeByContextMap[NC]) {
		if (this._blockedInputNames == null || !this._blockedInputNames.has(node.type())) {
			return node.io.inputs.inputs();
		} else {
			const blockedInputNames = this._blockedInputNames.get(node.type()) as string[];
			const inputConnectionPoints = node.io.inputs.namedInputConnectionPoints() as BaseGlConnectionPoint[];
			const inputConnectionPointNames = inputConnectionPoints.map((c) => c.name());
			const allowedInputNames = ArrayUtils.difference(inputConnectionPointNames, blockedInputNames);
			const inputs = allowedInputNames.map((inputName) => {
				const inputIndex = node.io.inputs.getNamedInputIndex(inputName);
				return node.io.inputs.input(inputIndex);
			});
			return inputs;
		}
	}

	private _findInputs(node: BaseNodeByContextMap[NC]) {
		if (this._traverseChildren()) {
			if (node.type() == NetworkChildNodeType.INPUT) {
				const parent = node.parent() as BaseNodeByContextMap[NC];
				return parent ? this.getNodeInputs(parent) : [];
				// return node.parent()?.io.inputs.inputs() || [];
			} else {
				if (node.childrenAllowed()) {
					// this._subnets_by_id.set(node.graphNodeId(), node);
					const outputNode = node.childrenController?.outputNode();
					return [outputNode];
				} else {
					return this.getNodeInputs(node); //node.io.inputs.inputs();
				}
			}
		} else {
			return this.getNodeInputs(node); //node.io.inputs.inputs();
		}
	}

	private _setNodesDepth() {
		this._leaves_graph_id.forEach((booleans_by_graph_id, shader_name) => {
			booleans_by_graph_id.forEach((boolean, graph_id) => {
				this._setNodeDepth(graph_id);
			});
		});
	}

	private _setNodeDepth(graph_id: CoreGraphNodeId, depth: number = 0) {
		/*
		adjust graph depth by hierarchical depth
		meaning that nodes inside a subnet should add their depth to the parent (and a multiplier)
		so that nodes outside of a subnet do not have a depth that ends up between the depths of 2 subnet children.
		*/
		// let depth_offset = 0;
		// const node = this._graph.node_from_id(graph_id) as BaseNodeType;
		// if (node.type == NetworkChildNodeType.INPUT) {
		// 	const parent = node.parent;
		// 	if (parent) {
		// 		depth_offset = parent.children().length * 10;
		// 	}
		// }
		// depth += depth_offset;
		/*
		end hierarchical depth adjustment
		*/

		const current_depth = this._depth_by_graph_id.get(graph_id);
		if (current_depth != null) {
			this._depth_by_graph_id.set(graph_id, Math.max(current_depth, depth));
		} else {
			this._depth_by_graph_id.set(graph_id, depth);
		}

		const output_ids = this._outputs_by_graph_id.get(graph_id);
		if (output_ids) {
			output_ids.forEach((output_id) => {
				this._setNodeDepth(output_id, depth + 1);
			});
		}
	}
}
