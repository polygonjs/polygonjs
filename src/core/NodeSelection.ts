// import UIData from './UIData';
import {BaseNodeType} from '../engine/nodes/_Base';
import {NodeEvent} from '../engine/poly/NodeEvent';
import {CoreGraphNodeId} from './graph/CoreGraph';
import {ArrayUtils} from './ArrayUtils';

export class CoreNodeSelection {
	_node_ids: CoreGraphNodeId[] = [];
	constructor(private _node: BaseNodeType) {
		// super();
		// this._node_ids = [];
	}

	node() {
		return this._node;
	}

	nodes(): BaseNodeType[] {
		return this._node.scene.graph.nodes_from_ids(this._node_ids) as BaseNodeType[];
	}

	contains(node: BaseNodeType): boolean {
		return this._node_ids.includes(node.graph_node_id);
	}
	equals(nodes: BaseNodeType[]): boolean {
		const node_ids = nodes.map((node) => node.graph_node_id).sort();
		return ArrayUtils.isEqual(node_ids, this._node_ids);
	}

	clear() {
		this._node_ids = [];
		this.send_update_event();
	}
	set(nodes: BaseNodeType[]) {
		// this.remove(this.nodes());
		this._node_ids = [];
		this.add(nodes);
	}

	add(nodes_to_add: BaseNodeType[]) {
		const node_ids_to_add = nodes_to_add.map((node) => node.graph_node_id);
		this._node_ids = ArrayUtils.union(this._node_ids, node_ids_to_add);

		this.send_update_event();
	}

	remove(nodes_to_remove: BaseNodeType[]) {
		const node_ids_to_remove = nodes_to_remove.map((node) => node.graph_node_id);
		this._node_ids = ArrayUtils.difference(this._node_ids, node_ids_to_remove);

		this.send_update_event();
	}

	private send_update_event() {
		this._node.emit(NodeEvent.SELECTION_UPDATED);
	}

	private _json: CoreGraphNodeId[] = [];
	toJSON() {
		this._json = this._json || [];
		this._json = this._node_ids.map((id) => id);
		return this._json;
	}
}
