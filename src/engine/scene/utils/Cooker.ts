import {PolyScene} from '../PolyScene';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

export class Cooker {
	constructor(private _scene: PolyScene) {}

	private _queue: Map<CoreGraphNodeId, CoreGraphNode | undefined> = new Map();
	private _nodeIdsInFlushingQueue: Set<CoreGraphNodeId> = new Set();
	private _blockLevel: number = 0;
	// private _processesCount: number = 0;

	block() {
		this._blockLevel += 1;
	}
	unblock() {
		this._blockLevel -= 1;
		if (this._blockLevel > 0) {
			return;
		}
		if (this._blockLevel < 0) {
			this._blockLevel = 0;
		}

		this._processQueue();
	}

	blocked() {
		return this._blockLevel > 0 || this._scene.loadingController.isLoading();
	}

	enqueue(node: CoreGraphNode, originalTriggerGraphNode?: CoreGraphNode) {
		if (!node.dirtyController.hasPostDirtyHooks()) {
			return;
		}
		if (this._queue.has(node.graphNodeId()) || this._nodeIdsInFlushingQueue.has(node.graphNodeId())) {
			return;
		}
		this._queue.set(node.graphNodeId(), originalTriggerGraphNode);
	}

	private _processQueue() {
		if (this.blocked()) {
			return;
		}
		if (this._queue.size == 0) {
			return;
		}

		// this.block();

		const originalTriggerGraphNodes: Array<CoreGraphNode | undefined> = [];
		const nodeIds: CoreGraphNodeId[] = [];
		this._queue.forEach((originalTriggerGraphNode, nodeId) => {
			originalTriggerGraphNodes.push(originalTriggerGraphNode);
			nodeIds.push(nodeId);
			this._nodeIdsInFlushingQueue.add(nodeId);
		});

		this._queue.clear();
		let i = 0;
		for (const originalTriggerGraphNode of originalTriggerGraphNodes) {
			const nodeId = nodeIds[i];
			this._processItem(originalTriggerGraphNode, nodeId);
			this._nodeIdsInFlushingQueue.delete(nodeId);
			i++;
		}

		// this.unblock();
	}
	private _processItem(originalTriggerGraphNode: CoreGraphNode | undefined, nodeId: CoreGraphNodeId) {
		const node = this._scene.graph.nodeFromId(nodeId);
		if (node) {
			node.dirtyController.runPostDirtyHooks(originalTriggerGraphNode);
		}
	}
}
