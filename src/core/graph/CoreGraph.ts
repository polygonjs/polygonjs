import {Graph, alg} from '@dagrejs/graphlib';
import lodash_uniq from 'lodash/uniq';
import lodash_flatten from 'lodash/flatten';
import {PolyScene} from 'src/engine/scene/PolyScene';
// import {NodeSimple} from './NodeSimple'
// import {GraphNode} from './concerns/GraphNode'
import {SceneNodeDirtyable} from './SceneNodeDirtyable';

// class DummyClass {}
// class GraphNodeDummy extends Dirtyable(DummyClass) {}

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

	next_id(): string {
		return `${(this._next_id += 1)}`;
	}

	setNode(node_owner: any) {
		this._graph.setNode(node_owner.graph_node_id(), {owner: node_owner});
	}

	removeNode(node_owner: any) {
		this._graph.removeNode(node_owner.graph_node_id());
	}

	nodes_from_ids(ids: string[]) {
		if (ids) {
			let node: any;
			return ids.map((id) => {
				if ((node = this.node_from_id(id)) != null) {
					return node;
				} else {
					return console.warn(`could not find node with id ${id}`);
				}
			});
		} else {
			return [];
		}
	}
	node_from_id(id: string) {
		let node: any;
		if ((node = this._graph.node(id)) != null) {
			return node.owner;
		}
	}

	connect(src: any, dest: any): boolean {
		const src_id = src.graph_node_id();
		const dest_id = dest.graph_node_id();

		if (this._graph.hasNode(src_id) && this._graph.hasNode(dest_id)) {
			this._graph.setEdge(src.graph_node_id(), dest.graph_node_id());

			// const scene_auto_updating = this.scene().auto_updating();
			const scene_loading = this.scene().is_loading();
			const check_if_graph_has_cycle = !scene_loading;
			let graph_has_cycle = false;
			if (check_if_graph_has_cycle) {
				graph_has_cycle = !alg.isAcyclic(this._graph);
			}

			if (graph_has_cycle) {
				this._graph.removeEdge(src.graph_node_id(), dest.graph_node_id());
				return false;
			} else {
				src.clear_successors_cache_with_predecessors();

				return true;
			}
		} else {
			console.warn(`attempt to connect non existing node ${src_id} or ${dest_id}`);
			return false;
		}
	}

	disconnect(src: SceneNodeDirtyable, dest: SceneNodeDirtyable) {
		if (src && dest) {
			this._graph.removeEdge(src.graph_node_id(), dest.graph_node_id());

			src.clear_successors_cache_with_predecessors();
		}
	}
	disconnect_predecessors(node_owner: SceneNodeDirtyable) {
		const predecessors = this.predecessors(node_owner);
		for (let predecessor of predecessors) {
			this.disconnect(predecessor, node_owner);
		}
	}
	disconnect_successors(node_owner: SceneNodeDirtyable) {
		const successors = this.successors(node_owner);
		for (let successor of successors) {
			this.disconnect(node_owner, successor);
		}
	}
	// disconnect_predecessors(node_owner){
	// 	const node_owner_id = node_owner.graph_node_id();
	// 	const predecessor_ids = this._graph.predecessors(node_owner_id);
	// 	if( predecessor_ids ){
	// 		for(let predecessor_id of predecessor_ids){
	// 			this._graph.removeEdge(predecessor_id, node_owner_id);
	// 		}
	// 	}
	// }
	// disconnect_successors(node_owner){
	// 	const node_owner_id = node_owner.graph_node_id();
	// 	const successor_ids = this._graph.successors(node_owner_id);
	// 	if (successor_ids) {
	// 		for(let successor_id of successor_ids){
	// 			this._graph.removeEdge(node_owner_id, successor_id);
	// 		}
	// 	}
	// }

	predecessor_ids(id: string) {
		return this._graph.predecessors(id) || [];
	}
	predecessors(node_owner: any) {
		const ids = this.predecessor_ids(node_owner.graph_node_id());
		return this.nodes_from_ids(ids);
	}
	successor_ids(id: string): string[] {
		const ids = this._graph.successors(id) || [];
		return ids;
	}
	successors(node_owner: any): any[] {
		const ids = this.successor_ids(node_owner.graph_node_id()) || [];
		return this.nodes_from_ids(ids);
	}

	all_predecessors(node_owner: any): any[] {
		const ids = [];
		let newly_added_ids = this.predecessor_ids(node_owner.graph_node_id());
		if (newly_added_ids) {
			ids.push(newly_added_ids);

			while (newly_added_ids && newly_added_ids.length > 0) {
				const next_ids = newly_added_ids.map((newly_added_id) => {
					return this.predecessor_ids(newly_added_id);
				});
				newly_added_ids = lodash_flatten(next_ids);
				ids.push(newly_added_ids);
			}
		}
		return this.nodes_from_ids(lodash_uniq(lodash_flatten(ids)));
	}

	all_successors(node_owner: any): any[] {
		const ids = [];
		let newly_added_ids = this.successor_ids(node_owner.graph_node_id());
		ids.push(newly_added_ids);

		while (newly_added_ids.length > 0) {
			newly_added_ids = lodash_flatten(
				newly_added_ids.map((newly_added_id) => {
					return this.successor_ids(newly_added_id);
				})
			);
			ids.push(newly_added_ids);
		}

		return this.nodes_from_ids(lodash_uniq(lodash_flatten(ids)));
	}
}
