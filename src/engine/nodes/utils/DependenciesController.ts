// /// <reference path="../../../../custom_typings/guards.d.ts" />
// // finally, guard ALL the types!
// function typeGuard<T extends PrimitiveOrConstructor>(o: any, className: T): o is GuardedType<T> {
// 	const localPrimitiveOrConstructor: PrimitiveOrConstructor = className;
// 	if (typeof localPrimitiveOrConstructor === 'string') {
// 		return typeof o === localPrimitiveOrConstructor;
// 	}
// 	return o instanceof localPrimitiveOrConstructor;
// }

// import lodash_groupBy from 'lodash/groupBy';
// import {BaseNodeType, BaseNodeClass} from '../_Base';

// import {BaseParamType, BaseParamClass} from '../../params/_Base';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

// enum METHODS {
// 	SUCCESSORS = 'graph_successors',
// 	PREDECESSORS = 'graph_predecessors',
// }

// export class DependenciesController {
// 	private _params_referrees_by_graph_node_id: Dictionary<BaseParamType> | undefined;

// 	constructor(protected node: BaseNodeType) {}

// 	// debug_dependencies() {
// 	// 	const nodes = this.scene_successors();
// 	// 	console.log('--------------------');
// 	// 	nodes.forEach((n) => {
// 	// 		console.log(n.full_path());
// 	// 	});
// 	// }

// 	scene_successors() {
// 		return this._find_scene_node_scene_nodes(METHODS.SUCCESSORS);
// 	}

// 	scene_predecessors() {
// 		return this._find_scene_node_scene_nodes(METHODS.PREDECESSORS);
// 	}
// 	private _find_scene_node_scene_nodes(method: METHODS): BaseNodeType[] {
// 		const params = this.node.params.all;
// 		const graph_nodes: CoreGraphNode[] = [];
// 		for (let param of params) {
// 			graph_nodes.push(param);
// 		}
// 		graph_nodes.push(this.node);
// 		const start_nodes = graph_nodes;
// 		let base_nodes: BaseNodeType[] = [];
// 		for (let start_node of start_nodes) {
// 			this._find_base_nodes_from_node(start_node, method, base_nodes);
// 		}

// 		if (method == METHODS.SUCCESSORS) {
// 			for (let node of this.param_nodes_referree()) {
// 				base_nodes.push(node);
// 			}
// 		}

// 		// ensure uniq and not current node
// 		base_nodes = base_nodes.filter((scene_node) => {
// 			return scene_node.graph_node_id != this.node.graph_node_id;
// 		});
// 		const base_nodes_by_graph_node_id = lodash_groupBy(base_nodes, (n) => n.graph_node_id);
// 		const uniq_base_nodes: BaseNodeType[] = [];
// 		Object.keys(base_nodes_by_graph_node_id).forEach((graph_node_id) => {
// 			uniq_base_nodes.push(base_nodes_by_graph_node_id[graph_node_id][0]);
// 		});
// 		return uniq_base_nodes;
// 	}

// 	private _find_base_nodes_from_node(node: CoreGraphNode, method: METHODS, base_nodes: BaseNodeType[]) {
// 		const next_nodes = node[method]();
// 		for (let next_node of next_nodes) {
// 			if (next_node instanceof BaseParamClass) {
// 				base_nodes.push(next_node.node);
// 			} else {
// 				if (typeGuard(next_node, BaseNodeClass)) {
// 					base_nodes.push(next_node);
// 				} else {
// 					this._find_base_nodes_from_node(next_node, method, base_nodes);
// 				}
// 			}
// 		}

// 		return base_nodes;
// 	}

// 	//
// 	//
// 	// REFERRED BY
// 	// which is used for operator path referring nodes without creating a graph edge
// 	//
// 	//
// 	add_param_referree(param: BaseParamType) {
// 		this._params_referrees_by_graph_node_id = this._params_referrees_by_graph_node_id || {};
// 		this._params_referrees_by_graph_node_id[param.graph_node_id] = param;
// 	}
// 	remove_param_referree(param: BaseParamType) {
// 		if (this._params_referrees_by_graph_node_id) {
// 			delete this._params_referrees_by_graph_node_id[param.graph_node_id];
// 		}
// 	}
// 	params_referree(): BaseParamType[] {
// 		const list = [];
// 		if (this._params_referrees_by_graph_node_id) {
// 			for (let graph_node_id of Object.keys(this._params_referrees_by_graph_node_id)) {
// 				list.push(this._params_referrees_by_graph_node_id[graph_node_id]);
// 			}
// 		}
// 		return list;
// 	}
// 	param_nodes_referree(): BaseNodeType[] {
// 		const node_by_graph_node_id: Dictionary<BaseNodeType> = {};
// 		let node;
// 		for (let param of this.params_referree()) {
// 			node = param.node;
// 			node_by_graph_node_id[node.graph_node_id] = node;
// 		}
// 		const list = [];
// 		for (let graph_node_id of Object.keys(node_by_graph_node_id)) {
// 			list.push(node_by_graph_node_id[graph_node_id]);
// 		}
// 		return list;
// 	}
// }
