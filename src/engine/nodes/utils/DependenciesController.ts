import lodash_groupBy from 'lodash/groupBy';
import {BaseNode} from '../_Base';

import {BaseParam} from 'src/engine/params/_Base';
import {CoreGraphNodeScene} from 'src/core/graph/CoreGraphNodeScene';

enum METHODS {
	SUCCESSORS = 'graph_successors',
	PREDECESSORS = 'graph_predecessors',
}

export class DependenciesController {
	private _params_referrees_by_graph_node_id: Dictionary<BaseParam>;

	constructor(protected node: BaseNode) {}

	// debug_dependencies() {
	// 	const nodes = this.scene_successors();
	// 	console.log('--------------------');
	// 	nodes.forEach((n) => {
	// 		console.log(n.full_path());
	// 	});
	// }

	scene_successors() {
		return this._find_scene_node_scene_nodes(METHODS.SUCCESSORS);
	}

	scene_predecessors() {
		return this._find_scene_node_scene_nodes(METHODS.PREDECESSORS);
	}
	private _find_scene_node_scene_nodes(method: METHODS) {
		const params: CoreGraphNodeScene[] = this.node.params.all;
		params.push(this.node);
		const start_nodes = params;
		let scene_nodes: BaseNode[] = [];
		start_nodes.forEach((start_node) => {
			this._find_graph_node_scene_nodes(start_node, method, scene_nodes);
		});

		if (method == METHODS.SUCCESSORS) {
			for (let node of this.param_nodes_referree()) {
				scene_nodes.push(node);
			}
		}

		// ensure uniq and not current node
		scene_nodes = scene_nodes.filter((scene_node) => {
			return scene_node.graph_node_id != this.node.graph_node_id;
		});
		const scene_nodes_by_graph_node_id = lodash_groupBy(scene_nodes, (n) => n.graph_node_id);
		const uniq_scene_nodes: CoreGraphNodeScene[] = [];
		Object.keys(scene_nodes_by_graph_node_id).forEach((graph_node_id) => {
			uniq_scene_nodes.push(scene_nodes_by_graph_node_id[graph_node_id][0]);
		});
		return uniq_scene_nodes;
	}

	private _find_graph_node_scene_nodes(node: CoreGraphNodeScene, method: METHODS, scene_nodes: BaseNode[]) {
		const next_nodes = node[method]();
		next_nodes.forEach((next_node) => {
			if (next_node.is_a(BaseParam)) {
				scene_nodes.push(next_node.node());
			} else {
				if (next_node.is_a(BaseNode)) {
					scene_nodes.push(next_node);
				} else {
					this._find_graph_node_scene_nodes(next_node, method, scene_nodes);
				}
			}
		});

		return scene_nodes;
	}

	//
	//
	// REFERRED BY
	// which is used for operator path referring nodes without creating a graph edge
	//
	//
	add_param_referree(param: BaseParam) {
		this._params_referrees_by_graph_node_id = this._params_referrees_by_graph_node_id || {};
		this._params_referrees_by_graph_node_id[param.graph_node_id()] = param;
	}
	remove_param_referree(param: BaseParam) {
		delete this._params_referrees_by_graph_node_id[param.graph_node_id()];
	}
	params_referree(): BaseParam[] {
		const list = [];
		if (this._params_referrees_by_graph_node_id) {
			for (let graph_node_id of Object.keys(this._params_referrees_by_graph_node_id)) {
				list.push(this._params_referrees_by_graph_node_id[graph_node_id]);
			}
		}
		return list;
	}
	param_nodes_referree(): BaseNode[] {
		const node_by_graph_node_id: Dictionary<BaseNode> = {};
		let node;
		for (let param of this.params_referree()) {
			node = param.node;
			node_by_graph_node_id[node.graph_node_id()] = node;
		}
		const list = [];
		for (let graph_node_id of Object.keys(node_by_graph_node_id)) {
			list.push(node_by_graph_node_id[graph_node_id]);
		}
		return list;
	}
}
