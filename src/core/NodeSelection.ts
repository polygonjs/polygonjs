import {BaseNodeType} from '../engine/nodes/_Base';
import {NodeEvent} from '../engine/poly/NodeEvent';
import {CoreGraphNodeId} from './graph/CoreGraph';
import {arrayIsEqual, arrayUnion, arrayDifference} from './ArrayUtils';

export class CoreNodeSelection {
	private _nodeIds: CoreGraphNodeId[] = [];
	constructor(private _node: BaseNodeType) {}

	node() {
		return this._node;
	}
	nodeIds() {
		return this._nodeIds;
	}

	nodes(): BaseNodeType[] {
		const target: BaseNodeType[] = [];
		this._node.scene().graph.nodesFromIds(this._nodeIds, target);
		return target;
	}

	contains(node: BaseNodeType): boolean {
		return this._nodeIds.includes(node.graphNodeId());
	}
	equals(nodes: BaseNodeType[]): boolean {
		const node_ids = nodes.map((node) => node.graphNodeId()).sort();
		return arrayIsEqual(node_ids, this._nodeIds);
	}

	clear() {
		this._nodeIds = [];
		this._sendUpdateEvent();
	}
	set(nodes: BaseNodeType[]) {
		this._nodeIds = [];
		this.add(nodes);
	}

	add(nodesToAdd: BaseNodeType[]) {
		const nodeIdsToAdd = nodesToAdd.map((node) => node.graphNodeId());
		this._nodeIds = arrayUnion(this._nodeIds, nodeIdsToAdd);

		this._sendUpdateEvent();
	}

	remove(nodesToRemove: BaseNodeType[]) {
		const nodeIdsToRemove = nodesToRemove.map((node) => node.graphNodeId());
		this._nodeIds = arrayDifference(this._nodeIds, nodeIdsToRemove);

		this._sendUpdateEvent();
	}

	private _checkValidity() {
		const nodes = this.nodes();
		if (nodes.length != this._nodeIds.length) {
			console.error('selection invalid: at least one node is not part of the graph');
			return;
		}
		for (let node of nodes) {
			if (node.parent() != this._node) {
				console.error('selection invalid: at least one node is not has another parent');
			}
		}
	}

	private _sendUpdateEvent() {
		this._checkValidity();
		this._node.emit(NodeEvent.SELECTION_UPDATED);
	}

	private _json: CoreGraphNodeId[] = [];
	toJSON() {
		this._json = this._json || [];
		this._json = this._nodeIds.map((id) => id);
		return this._json;
	}
}
