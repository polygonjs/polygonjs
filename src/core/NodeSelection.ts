// import UIData from './UIData';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import lodash_difference from 'lodash/difference';
import lodash_union from 'lodash/union';
// import lodash_isArray from 'lodash/isArray'
import lodash_isEqual from 'lodash/isEqual';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

export default class NodeSelection {
	_node_ids: string[] = [];
	constructor(private _node: BaseNodeType) {
		// super();
		// this._node_ids = [];
	}

	node() {
		return this._node;
	}

	clear() {
		this._node_ids = [];
	}

	nodes(): BaseNodeType[] {
		return this._node.scene.graph.nodes_from_ids(this._node_ids) as BaseNodeType[];
	}

	contains(node: BaseNodeType): boolean {
		return this._node_ids.includes(node.graph_node_id);
	}
	equals(nodes: BaseNodeType[]): boolean {
		const node_ids = nodes.map((node) => node.graph_node_id).sort();
		return lodash_isEqual(node_ids, this._node_ids);
	}

	set(nodes: BaseNodeType[]) {
		// this.remove(this.nodes());
		this._node_ids = [];
		this.add(nodes);
	}

	add(nodes_to_add: BaseNodeType[]) {
		// if (!lodash_isArray(nodes_to_add)) { nodes_to_add = [nodes_to_add]; }

		const node_ids_to_add = nodes_to_add.map((node) => node.graph_node_id);
		this._node_ids = lodash_union(this._node_ids, node_ids_to_add);

		this.update_nodes_ui_data(nodes_to_add);
	}

	remove(nodes_to_remove: BaseNodeType[]) {
		// if (!lodash_isArray(nodes_to_remove)) { nodes_to_remove = [nodes_to_remove]; }

		const node_ids_to_remove = nodes_to_remove.map((node) => node.graph_node_id);
		this._node_ids = lodash_difference(this._node_ids, node_ids_to_remove);

		this.update_nodes_ui_data(nodes_to_remove);
	}

	private update_nodes_ui_data(nodes: BaseNodeType[]) {
		this._node.emit(NodeEvent.SELECTION_UPDATED);
	}

	to_json() {
		return this._node_ids;
	}
}
