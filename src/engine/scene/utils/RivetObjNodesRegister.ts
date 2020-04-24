// import {PolyScene} from '../..';
// import {RivetObjNode} from '../../nodes/obj/Rivet';

// export class RivetObjNodesRegister {
// 	private _nodes_by_graph_node_id: Map<string, RivetObjNode> = new Map();
// 	private _sorted_ids: string[] = [];
// 	constructor(protected scene: PolyScene) {}

// 	update_rivet_transforms() {
// 		for (let id of this._sorted_ids) {
// 			const node = this._nodes_by_graph_node_id.get(id);
// 			if (node) {
// 				// node.update_object_position();
// 			}
// 		}
// 	}

// 	register_rivet(node: RivetObjNode) {
// 		this._nodes_by_graph_node_id.set(node.graph_node_id, node);
// 		this.sort_rivets();
// 	}
// 	// TODO: there seems to be unregister and deregister used in other classes. unify one or the other
// 	deregister_rivet(node: RivetObjNode) {
// 		this._nodes_by_graph_node_id.delete(node.graph_node_id);
// 		this.sort_rivets();
// 	}

// 	sort_rivets() {
// 		const id_by_name: Map<string, string> = new Map();
// 		const sorted_names: string[] = [];
// 		this._nodes_by_graph_node_id.forEach((node, id) => {
// 			id_by_name.set(node.name, id);
// 			sorted_names.push(node.name);
// 		});
// 		sorted_names.sort();
// 		this._sorted_ids = [];
// 		for (let name of sorted_names) {
// 			const id = id_by_name.get(name);
// 			if (id) {
// 				this._sorted_ids.push(id);
// 			}
// 		}
// 	}
// }
