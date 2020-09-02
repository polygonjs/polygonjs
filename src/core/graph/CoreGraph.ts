import {PolyScene} from '../../engine/scene/PolyScene';
import {CoreGraphNode} from './CoreGraphNode';

export type CoreGraphNodeId = number;

export class CoreGraph {
	// private _graph: Graph;
	private _next_id: CoreGraphNodeId = 0;
	private _scene: PolyScene | undefined;
	private _successors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _predecessors: Map<CoreGraphNodeId, Set<CoreGraphNodeId>> = new Map();
	private _nodes_by_id: Map<number, CoreGraphNode> = new Map();

	set_scene(scene: PolyScene) {
		this._scene = scene;
	}
	scene() {
		return this._scene;
	}

	next_id(): CoreGraphNodeId {
		this._next_id += 1;
		return this._next_id;
	}

	nodes_from_ids(ids: number[]) {
		const nodes: CoreGraphNode[] = [];
		for (let id of ids) {
			const node = this.node_from_id(id);
			if (node) {
				nodes.push(node);
			}
		}
		return nodes;
	}
	// TODO: this should return CoreGraphNodeId|null
	node_from_id(id: number): CoreGraphNode | undefined {
		// return this._graph.node(id);
		return this._nodes_by_id.get(id);
	}
	has_node(node: CoreGraphNode): boolean {
		return this._nodes_by_id.get(node.graph_node_id) != null;
	}
	add_node(node: CoreGraphNode) {
		this._nodes_by_id.set(node.graph_node_id, node);
		// this._successors.set(node.graph_node_id, new Set());
		// this._predecessors.set(node.graph_node_id, new Set());
	}
	remove_node(node: CoreGraphNode) {
		this._nodes_by_id.delete(node.graph_node_id);
		this._successors.delete(node.graph_node_id);
		this._predecessors.delete(node.graph_node_id);
	}
	connect(src: CoreGraphNode, dest: CoreGraphNode, check_if_graph_may_have_cycle = true): boolean {
		const src_id = src.graph_node_id;
		const dest_id = dest.graph_node_id;

		if (this.has_node(src) && this.has_node(dest)) {
			// this._graph.setEdge(src_id, dest_id);

			// if check_if_graph_may_have_cycle is passed as false, that means we never check.
			// this can be useful when we know that the connection will not create a cycle,
			// such as when connecting params or inputs to a node
			if (check_if_graph_may_have_cycle) {
				const scene_loading = this._scene ? this._scene.loading_controller.is_loading : true;
				check_if_graph_may_have_cycle = !scene_loading;
			}
			let graph_would_have_cycle = false;
			if (check_if_graph_may_have_cycle) {
				// graph_has_cycle = !alg.isAcyclic(this._graph);
				graph_would_have_cycle = this._has_predecessor(src_id, dest_id);
			}

			if (graph_would_have_cycle) {
				// this._graph.removeEdge(src_id, dest_id);
				return false;
			} else {
				this._create_connection(src_id, dest_id);
				src.dirty_controller.clear_successors_cache_with_predecessors();

				return true;
			}
		} else {
			console.warn(`attempt to connect non existing node ${src_id} or ${dest_id}`);
			return false;
		}
	}

	disconnect(src: CoreGraphNode, dest: CoreGraphNode) {
		// const src_id_s = src.graph_node_id;
		// const dest_id_s = dest.graph_node_id;
		// this._graph.removeEdge(src_id_s, dest_id_s);
		this._remove_connection(src.graph_node_id, dest.graph_node_id);

		src.dirty_controller.clear_successors_cache_with_predecessors();
	}
	disconnect_predecessors(node: CoreGraphNode) {
		const predecessors = this.predecessors(node);
		for (let predecessor of predecessors) {
			this.disconnect(predecessor, node);
		}
	}
	disconnect_successors(node: CoreGraphNode) {
		const successors = this.successors(node);
		for (let successor of successors) {
			this.disconnect(node, successor);
		}
	}

	predecessor_ids(id: CoreGraphNodeId): CoreGraphNodeId[] {
		const map = this._predecessors.get(id);
		if (map) {
			const ids: CoreGraphNodeId[] = [];
			map.forEach((bool, id) => {
				ids.push(id);
			});
			return ids;
		}
		return [];
	}
	predecessors(node: CoreGraphNode) {
		const ids = this.predecessor_ids(node.graph_node_id);
		return this.nodes_from_ids(ids);
	}
	successor_ids(id: CoreGraphNodeId): CoreGraphNodeId[] {
		const map = this._successors.get(id);
		if (map) {
			const ids: CoreGraphNodeId[] = [];
			map.forEach((bool, id) => {
				ids.push(id);
			});
			return ids;
		}
		return [];
	}
	successors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.successor_ids(node.graph_node_id) || [];
		return this.nodes_from_ids(ids);
	}
	all_predecessor_ids(node: CoreGraphNode): CoreGraphNodeId[] {
		return this.all_next_ids(node, 'predecessor_ids');
	}
	all_successor_ids(node: CoreGraphNode): CoreGraphNodeId[] {
		return this.all_next_ids(node, 'successor_ids');
	}
	all_predecessors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.all_predecessor_ids(node);
		return this.nodes_from_ids(ids);
	}
	all_successors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.all_successor_ids(node);
		return this.nodes_from_ids(ids);
	}
	private _create_connection(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId) {
		// set successors
		let node_successors = this._successors.get(src_id);
		if (!node_successors) {
			node_successors = new Set();
			this._successors.set(src_id, node_successors);
		}
		if (node_successors.has(dest_id)) {
			return;
		}
		node_successors.add(dest_id);
		// set predecessors
		let node_predecessors = this._predecessors.get(dest_id);
		if (!node_predecessors) {
			node_predecessors = new Set();
			this._predecessors.set(dest_id, node_predecessors);
		}
		node_predecessors.add(src_id);
	}
	private _remove_connection(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId) {
		// remove successors
		let node_successors = this._successors.get(src_id);
		if (node_successors) {
			node_successors.delete(dest_id);
			if (node_successors.size == 0) {
				this._successors.delete(src_id);
			}
		}
		// remove predecessors
		let node_predecessors = this._predecessors.get(dest_id);
		if (node_predecessors) {
			node_predecessors.delete(src_id);
			if (node_predecessors.size == 0) {
				this._predecessors.delete(dest_id);
			}
		}
	}

	private all_next_ids(node: CoreGraphNode, method: 'successor_ids' | 'predecessor_ids'): CoreGraphNodeId[] {
		const ids_by_id: Map<CoreGraphNodeId, boolean> = new Map();
		const ids: CoreGraphNodeId[] = [];
		let next_ids = this[method](node.graph_node_id);

		while (next_ids.length > 0) {
			const next_next_ids = [];
			for (let next_id of next_ids) {
				for (let next_next_id of this[method](next_id)) {
					next_next_ids.push(next_next_id);
				}
			}

			for (let id of next_ids) {
				ids_by_id.set(id, true);
				// ids.push(id);
			}
			for (let id of next_next_ids) {
				next_ids.push(id);
			}
			next_ids = next_next_ids;
		}
		ids_by_id.forEach((bool, id) => {
			ids.push(id);
		});
		return ids;
	}

	private _has_predecessor(src_id: CoreGraphNodeId, dest_id: CoreGraphNodeId): boolean {
		const ids = this.predecessor_ids(src_id);
		if (ids) {
			if (ids.includes(dest_id)) {
				return true;
			} else {
				for (let id of ids) {
					return this._has_predecessor(id, dest_id);
				}
			}
		}

		return false;
	}
}
