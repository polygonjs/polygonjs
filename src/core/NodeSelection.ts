import {BaseNodeType} from '../engine/nodes/_Base';
import {NodeEvent} from '../engine/poly/NodeEvent';
import {CoreGraphNodeId} from './graph/CoreGraph';
import {arrayIsEqual, arrayUnion, arrayDifference, arrayMap, arrayCopy} from './ArrayUtils';

const _nodes: BaseNodeType[] = [];
const _nodeIds: number[] = [];
export class CoreNodeSelection {
	private _nodeIds: CoreGraphNodeId[] = [];
	constructor(private _node: BaseNodeType) {}

	node() {
		return this._node;
	}
	nodeIds() {
		return this._nodeIds;
	}

	nodeFromIndex(index: number): BaseNodeType | undefined {
		this._node.scene().graph.nodesFromIds(this._nodeIds, _nodes);
		return _nodes[index];
	}
	nodes(target: BaseNodeType[]): BaseNodeType[] {
		this._node.scene().graph.nodesFromIds(this._nodeIds, target);
		return target;
	}

	contains(node: BaseNodeType): boolean {
		return this._nodeIds.includes(node.graphNodeId());
	}
	equals(nodes: BaseNodeType[]): boolean {
		arrayMap(nodes, (node) => node.graphNodeId(), _nodeIds);
		_nodeIds.sort();
		return arrayIsEqual(_nodeIds, this._nodeIds);
	}

	clear() {
		this._nodeIds.length = 0;
		this._sendUpdateEvent();
	}
	set(nodes: Readonly<BaseNodeType[]>) {
		this._nodeIds.length = 0;
		this.add(nodes);
	}

	add(nodesToAdd: Readonly<BaseNodeType[]>) {
		arrayMap(nodesToAdd, (node) => node.graphNodeId(), _nodeIds);
		arrayUnion(this._nodeIds, _nodeIds, this._nodeIds);

		this._sendUpdateEvent();
	}

	remove(nodesToRemove: Readonly<BaseNodeType[]>) {
		arrayMap(nodesToRemove, (node) => node.graphNodeId(), _nodeIds);
		arrayDifference(this._nodeIds, _nodeIds, this._nodeIds);

		this._sendUpdateEvent();
	}

	private _checkValidity() {
		this.nodes(_nodes);
		if (_nodes.length != this._nodeIds.length) {
			console.error('selection invalid: at least one node is not part of the graph');
			return;
		}
		for (const node of _nodes) {
			if (node.parent() != this._node) {
				console.error('selection invalid: at least one node is not has another parent');
			}
		}
	}

	private _sendUpdateEvent() {
		this._checkValidity();
		this._node.emit(NodeEvent.SELECTION_UPDATED);
	}

	toJSON(target: CoreGraphNodeId[]): void {
		arrayCopy(this._nodeIds, target);
	}
}
