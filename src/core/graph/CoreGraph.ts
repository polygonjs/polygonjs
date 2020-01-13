import {Graph, alg} from '@dagrejs/graphlib';
// import lodash_uniq from 'lodash/uniq';
// import lodash_flatten from 'lodash/flatten';
import {PolyScene} from 'src/engine/scene/PolyScene';
// import {NodeSimple} from './NodeSimple'
// import {GraphNode} from './concerns/GraphNode'
// import {SceneNodeDirtyable} from './SceneNodeDirtyable';

// class DummyClass {}
// class GraphNodeDummy extends Dirtyable(DummyClass) {}

// TODO: typescript, using ids with a specific type (https://basarat.gitbook.io/typescript/main-1/nominaltyping)
// export interface CoreGraphNodeId extends String {
// 	// _CoreGraphNodeIdBrand: string;
// }
export type CoreGraphNodeId = string;
import {CoreGraphNode} from './CoreGraphNode';

export class CoreGraph {
	_graph: Graph;
	_next_id: number = 0;
	_scene: PolyScene;

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
		// if (ids) {
		// 	let node: any;
		// 	return ids.map((id) => {
		// 		if ((node = this.node_from_id(id)) != null) {
		// 			return node;
		// 		} else {
		// 			return console.warn(`could not find node with id ${id}`);
		// 		}
		// 	});
		// } else {
		// 	return [];
		// }
	}
	node_from_id(id: string) {
		return this._graph.node(id);
	}

	connect(src: CoreGraphNode, dest: CoreGraphNode): boolean {
		const src_id = src.graph_node_id;
		const dest_id = dest.graph_node_id;

		if (this._graph.hasNode(src_id) && this._graph.hasNode(dest_id)) {
			this._graph.setEdge(src.graph_node_id, dest.graph_node_id);

			// const scene_auto_updating = this.scene().auto_updating();
			const scene_loading = this.scene().loading_controller.is_loading;
			const check_if_graph_has_cycle = !scene_loading;
			let graph_has_cycle = false;
			if (check_if_graph_has_cycle) {
				graph_has_cycle = !alg.isAcyclic(this._graph);
			}

			if (graph_has_cycle) {
				this._graph.removeEdge(src.graph_node_id, dest.graph_node_id);
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
	// disconnect_predecessors(node){
	// 	const node_id = node.graph_node_id;
	// 	const predecessor_ids = this._graph.predecessors(node_id);
	// 	if( predecessor_ids ){
	// 		for(let predecessor_id of predecessor_ids){
	// 			this._graph.removeEdge(predecessor_id, node_id);
	// 		}
	// 	}
	// }
	// disconnect_successors(node){
	// 	const node_id = node.graph_node_id;
	// 	const successor_ids = this._graph.successors(node_id);
	// 	if (successor_ids) {
	// 		for(let successor_id of successor_ids){
	// 			this._graph.removeEdge(node_id, successor_id);
	// 		}
	// 	}
	// }

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
				ids.push(id);
			}
			for (let id of next_next_ids) {
				next_ids.push(id);
			}
			next_ids = next_next_ids;
		}
		return ids;
	}
	all_predecessor_ids(node: CoreGraphNode): CoreGraphNodeId[] {
		return this.all_next_ids(node, 'predecessor_ids');
	}
	all_successor_ids(node: CoreGraphNode): CoreGraphNodeId[] {
		return this.all_next_ids(node, 'successor_ids');
	}
	all_predecessors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.all_successor_ids(node);
		return this.nodes_from_ids(ids);
	}
	all_successors(node: CoreGraphNode): CoreGraphNode[] {
		const ids = this.all_successor_ids(node);
		return this.nodes_from_ids(ids);
	}
}
