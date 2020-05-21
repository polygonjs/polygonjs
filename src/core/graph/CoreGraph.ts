/// <reference path="./dagre.d.ts" />
import {Graph, alg} from '@dagrejs/graphlib';
import {PolyScene} from '../../engine/scene/PolyScene';

// TODO: try using ids with a specific type (https://basarat.gitbook.io/typescript/main-1/nominaltyping)
export type CoreGraphNodeId = string;
import {CoreGraphNode} from './CoreGraphNode';

export class CoreGraph {
	_graph: Graph;
	_next_id: number = 0;
	_scene: PolyScene | undefined;

	constructor() {
		this._graph = new Graph({
			directed: true,
			compound: false,
			multigraph: true,
		});
	}

	graph() {
		return this._graph;
	}
	set_scene(scene: PolyScene) {
		this._scene = scene;
	}
	scene() {
		return this._scene;
	}

	next_id(): CoreGraphNodeId {
		return (<unknown>`${(this._next_id += 1)}`) as CoreGraphNodeId;
	}

	setNode(node: CoreGraphNode) {
		this._graph.setNode(node.graph_node_id, node);
	}

	removeNode(node: CoreGraphNode) {
		this._graph.removeNode(node.graph_node_id);
	}

	nodes_from_ids(ids: string[]) {
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
	node_from_id(id: string): CoreGraphNode {
		return this._graph.node(id);
	}

	connect(src: CoreGraphNode, dest: CoreGraphNode, check_if_graph_has_cycle = true): boolean {
		const src_id = src.graph_node_id;
		const dest_id = dest.graph_node_id;

		if (this._graph.hasNode(src_id) && this._graph.hasNode(dest_id)) {
			this._graph.setEdge(src_id, dest_id);

			// if check_if_graph_has_cycle is passed as false, that means we never check.
			// this can be useful when we know that the connection will not create a cycle,
			// such as when connecting params or inputs to a node
			if (check_if_graph_has_cycle) {
				const scene_loading = this._scene ? this._scene.loading_controller.is_loading : true;
				check_if_graph_has_cycle = !scene_loading;
			}
			let graph_has_cycle = false;
			if (check_if_graph_has_cycle) {
				graph_has_cycle = !alg.isAcyclic(this._graph);
			}

			if (graph_has_cycle) {
				this._graph.removeEdge(src_id, dest_id);
				return false;
			} else {
				src.dirty_controller.clear_successors_cache_with_predecessors();

				return true;
			}
		} else {
			console.warn(`attempt to connect non existing node ${src_id} or ${dest_id}`);
			return false;
		}
	}

	disconnect(src: CoreGraphNode, dest: CoreGraphNode) {
		if (src && dest) {
			const src_id_s = src.graph_node_id;
			const dest_id_s = dest.graph_node_id;
			this._graph.removeEdge(src_id_s, dest_id_s);

			src.dirty_controller.clear_successors_cache_with_predecessors();
		}
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

	predecessor_ids(id: CoreGraphNodeId) {
		return this._graph.predecessors(id) || [];
	}
	predecessors(node: CoreGraphNode) {
		const ids = this.predecessor_ids(node.graph_node_id);
		return this.nodes_from_ids(ids);
	}
	successor_ids(id: string): CoreGraphNodeId[] {
		return this._graph.successors(id) || [];
	}
	successors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.successor_ids(node.graph_node_id) || [];
		return this.nodes_from_ids(ids);
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
}
