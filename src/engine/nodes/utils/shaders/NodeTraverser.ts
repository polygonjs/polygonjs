import {CoreGraph} from '../../../../core/graph/CoreGraph';
import {MapUtils} from '../../../../core/MapUtils';
import {ShaderName} from './ShaderName';
import {TypedNode, BaseNodeType} from '../../_Base';
import {NodeContext, NetworkChildNodeType} from '../../../poly/NodeContext';
import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import { ArrayUtils } from '../../../../core/ArrayUtils';

// type NumberByString = Map<string, number>;
type NumberByCoreGraphNodeId = Map<CoreGraphNodeId, number>;
// type BaseNodeTypeByString = Map<string, BaseNodeType>;
// type BooleanByString = Map<string, boolean>;
type BooleanByCoreGraphNodeId = Map<CoreGraphNodeId, boolean>;
type BooleanByStringByShaderName = Map<ShaderName, BooleanByCoreGraphNodeId>;
type StringArrayByString = Map<CoreGraphNodeId, CoreGraphNodeId[]>;
type InputNamesByShaderNameMethod<NC extends NodeContext> = (
	root_node: NodeTypeMap[NC],
	shader_name: ShaderName
) => string[];
export class TypedNodeTraverser<NC extends NodeContext> {
	private _leaves_graph_id: BooleanByStringByShaderName = new Map();
	private _graph_ids_by_shader_name: BooleanByStringByShaderName = new Map();
	private _outputs_by_graph_id: StringArrayByString = new Map();
	private _depth_by_graph_id: NumberByCoreGraphNodeId = new Map();
	private _graph_id_by_depth: Map<number, CoreGraphNodeId[]> = new Map();
	private _graph: CoreGraph;
	private _shader_name!: ShaderName;
	// private _subnets_by_id: BaseNodeTypeByString = new Map();

	constructor(
		private _parent_node: TypedNode<NC, any>,
		private _shader_names: ShaderName[],
		private _input_names_for_shader_name_method: InputNamesByShaderNameMethod<NC>
	) {
		this._graph = this._parent_node.scene.graph;
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

	shader_names() {
		return this._shader_names;
	}
	input_names_for_shader_name(root_node: NodeTypeMap[NC], shader_name: ShaderName) {
		return this._input_names_for_shader_name_method(root_node, shader_name);
	}

	traverse(root_nodes: NodeTypeMap[NC][]) {
		this.reset();

		for (let shader_name of this.shader_names()) {
			this._leaves_graph_id.set(shader_name, new Map());
		}

		for (let shader_name of this.shader_names()) {
			this._shader_name = shader_name;
			for (let root_node of root_nodes) {
				this.find_leaves_from_root_node(root_node);
				this.set_nodes_depth();
			}
		}

		// graph_ids.forEach((graph_id) => {
		this._depth_by_graph_id.forEach((depth: number, graph_id: CoreGraphNodeId) => {
			if (depth != null) {
				// this._graph_id_by_depth.set(depth, this._graph_id_by_depth.get(depth) || []);
				// this._graph_id_by_depth.get(depth)?.push(graph_id);
				MapUtils.push_on_array_at_entry(this._graph_id_by_depth, depth, graph_id);
			}
		});
	}

	leaves_from_nodes(nodes: NodeTypeMap[NC][]) {
		this._shader_name = ShaderName.LEAVES_FROM_NODES_SHADER;
		this._graph_ids_by_shader_name.set(this._shader_name, new Map());
		this._leaves_graph_id.set(this._shader_name, new Map());
		for (let node of nodes) {
			this.find_leaves(node);
		}

		const node_ids: CoreGraphNodeId[] = [];
		this._leaves_graph_id.get(this._shader_name)?.forEach((value: boolean, key: CoreGraphNodeId) => {
			node_ids.push(key);
		});
		return this._graph.nodes_from_ids(node_ids) as NodeTypeMap[NC][];
	}

	nodes_for_shader_name(shader_name: ShaderName) {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((value: CoreGraphNodeId[], key: number) => {
			depths.push(key);
		});
		depths.sort((a, b) => a - b);
		const nodes: NodeTypeMap[NC][] = [];
		const node_id_used_state: Map<CoreGraphNodeId, boolean> = new Map();
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				graph_ids_for_depth.forEach((graph_id: CoreGraphNodeId) => {
					const is_present = this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id);
					if (is_present) {
						const node = this._graph.node_from_id(graph_id) as NodeTypeMap[NC];

						this.add_nodes_with_children(node, node_id_used_state, nodes, shader_name);
					}
				});
			}
		});
		return nodes;
	}
	sorted_nodes() {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((ids: CoreGraphNodeId[], depth: number) => {
			depths.push(depth);
		});
		depths.sort((a, b) => a - b);
		const nodes: NodeTypeMap[NC][] = [];
		const node_id_used_state: Map<CoreGraphNodeId, boolean> = new Map();
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				for (let graph_id of graph_ids_for_depth) {
					const node = this._graph.node_from_id(graph_id) as NodeTypeMap[NC];
					if (node) {
						this.add_nodes_with_children(node, node_id_used_state, nodes);
					}
				}
			}
		});

		return nodes;
	}
	add_nodes_with_children(
		node: NodeTypeMap[NC],
		node_id_used_state: Map<CoreGraphNodeId, boolean>,
		accumulated_nodes: NodeTypeMap[NC][],
		shader_name?: ShaderName
	) {
		if (!node_id_used_state.get(node.graph_node_id)) {
			accumulated_nodes.push(node);
			node_id_used_state.set(node.graph_node_id, true);
		}

		if (node.type == NetworkChildNodeType.INPUT) {
			if (node.parent) {
				const nodes_with_same_parent_as_subnet_input = this.sorted_nodes_for_shader_name_for_parent(
					node.parent,
					shader_name
				);
				for (let child_node of nodes_with_same_parent_as_subnet_input) {
					if (child_node.graph_node_id != node.graph_node_id) {
						this.add_nodes_with_children(child_node, node_id_used_state, accumulated_nodes, shader_name);
					}
				}
			}
		}
	}

	sorted_nodes_for_shader_name_for_parent(parent: BaseNodeType, shader_name?: ShaderName) {
		const depths: number[] = [];
		this._graph_id_by_depth.forEach((value: CoreGraphNodeId[], key: number) => {
			depths.push(key);
		});
		depths.sort((a, b) => a - b);
		const nodes: NodeTypeMap[NC][] = [];
		depths.forEach((depth) => {
			const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
			if (graph_ids_for_depth) {
				graph_ids_for_depth.forEach((graph_id: CoreGraphNodeId) => {
					const is_present = shader_name
						? this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id)
						: true;
					if (is_present) {
						const node = this._graph.node_from_id(graph_id) as NodeTypeMap[NC];
						if (node.parent == parent) {
							nodes.push(node);
						}
					}
				});
			}
		});
		const first_node = nodes[0];
		if (parent.node_context() == first_node.node_context()) {
			nodes.push(parent as NodeTypeMap[NC]);
		}

		return nodes;
	}

	private find_leaves_from_root_node(root_node: NodeTypeMap[NC]) {
		this._graph_ids_by_shader_name.get(this._shader_name)?.set(root_node.graph_node_id, true);

		const input_names = this.input_names_for_shader_name(root_node, this._shader_name);
		if (input_names) {
			for (let input_name of input_names) {
				const input = root_node.io.inputs.named_input(input_name) as NodeTypeMap[NC];
				if (input) {
					MapUtils.push_on_array_at_entry(
						this._outputs_by_graph_id,
						input.graph_node_id,
						root_node.graph_node_id
					);
					this.find_leaves(input);
				}
			}
		}

		this._outputs_by_graph_id.forEach((outputs: CoreGraphNodeId[], graph_id: CoreGraphNodeId) => {
			this._outputs_by_graph_id.set(graph_id, ArrayUtils.uniq(outputs));
		});
	}

	private find_leaves(node: NodeTypeMap[NC]) {
		this._graph_ids_by_shader_name.get(this._shader_name)?.set(node.graph_node_id, true);

		const inputs = this._find_inputs_or_children(node) as NodeTypeMap[NC][];
		const compact_inputs: NodeTypeMap[NC][] = ArrayUtils.compact(inputs);
		const input_graph_ids = ArrayUtils.uniq(compact_inputs.map((n) => n.graph_node_id));
		const unique_inputs = input_graph_ids.map((graph_id) =>
			this._graph.node_from_id(graph_id)
		) as NodeTypeMap[NC][];
		if (unique_inputs.length > 0) {
			for (let input of unique_inputs) {
				MapUtils.push_on_array_at_entry(this._outputs_by_graph_id, input.graph_node_id, node.graph_node_id);

				this.find_leaves(input);
			}
		} else {
			this._leaves_graph_id.get(this._shader_name)!.set(node.graph_node_id, true);
		}
	}

	private _find_inputs_or_children(node: NodeTypeMap[NC]) {
		if (node.type == NetworkChildNodeType.INPUT) {
			return node.parent?.io.inputs.inputs() || [];
		} else {
			if (node.children_allowed()) {
				// this._subnets_by_id.set(node.graph_node_id, node);
				const output_node = node.children_controller?.output_node();
				return [output_node];
			} else {
				return node.io.inputs.inputs();
			}
		}
	}

	private set_nodes_depth() {
		this._leaves_graph_id.forEach((booleans_by_graph_id, shader_name) => {
			booleans_by_graph_id.forEach((boolean, graph_id) => {
				this.set_node_depth(graph_id);
			});
		});
	}

	private set_node_depth(graph_id: CoreGraphNodeId, depth: number = 0) {
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
				this.set_node_depth(output_id, depth + 1);
			});
		}
	}
}
