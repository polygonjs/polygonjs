import {PolyScene} from '../PolyScene';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

export class Cooker {
	constructor(private _scene: PolyScene) {}
	// constructor(private _graph: CoreGraph) {
	// 	this._blockLevel = 0;
	// }

	private _queue: Map<CoreGraphNodeId, CoreGraphNode | undefined> = new Map();
	private _blockLevel: number = 0;

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
		this._queue.set(node.graphNodeId(), originalTriggerGraphNode);
	}

	private _processQueue() {
		if (this.blocked()) {
			return;
		}
		const nodes: Array<CoreGraphNode | undefined> = [];
		const nodeIds: CoreGraphNodeId[] = [];
		this._queue.forEach((node, nodeId) => {
			nodes.push(node);
			nodeIds.push(nodeId);
		});
		// if (nodes.length) {
		// 	console.warn('scene process queue START', this._blockLevel, nodes);
		// }
		this._queue.clear();
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			const nodeId = nodeIds[i];
			this._processItem(node, nodeId);
		}
		// if (nodes.length) {
		// 	console.log('scene process queue DONE');
		// }
	}
	private _processItem(originalTriggerGraphNode: CoreGraphNode | undefined, id: CoreGraphNodeId) {
		const node = this._scene.graph.nodeFromId(id);
		if (node) {
			node.dirtyController.runPostDirtyHooks(originalTriggerGraphNode);
		}
	}
}
