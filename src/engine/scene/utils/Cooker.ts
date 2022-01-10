// import {CoreGraphNode} from './CoreGraphNode';
// import { CoreGraphNodeScene } from './CoreGraphNodeScene';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {PolyScene} from '../PolyScene';

// interface CookerQueue {
// 	[propName: string]: CoreGraphNodeSceneNamed;
// }

export class Cooker {
	private _queue: Map<CoreGraphNodeId, CoreGraphNode | undefined> = new Map();
	private _blockLevel: number = 0;

	constructor(private _scene: PolyScene) {
		this._blockLevel = 0;
	}

	block() {
		this._blockLevel += 1;
	}
	unblock() {
		this._blockLevel -= 1;
		if (this._blockLevel < 0) {
			this._blockLevel = 0;
		}

		this.process_queue();
	}
	// unblock_later: ->
	// 	setTimeout( this.unblock.bind(this), 0 )
	blocked() {
		return this._blockLevel > 0;
	}

	enqueue(node: CoreGraphNode, original_trigger_graph_node?: CoreGraphNode) {
		this._queue.set(node.graphNodeId(), original_trigger_graph_node);
	}

	process_queue() {
		if (this.blocked()) {
			return;
		}
		const nodes: Array<CoreGraphNode | undefined> = [];
		const nodeIds: CoreGraphNodeId[] = [];
		this._queue.forEach((node, nodeId) => {
			nodes.push(node);
			nodeIds.push(nodeId);
		});
		this._queue.clear();
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			const nodeId = nodeIds[i];
			this._processItem(node, nodeId);
		}
	}
	private _processItem(original_trigger_graph_node: CoreGraphNode | undefined, id: CoreGraphNodeId) {
		const node = this._scene.graph.nodeFromId(id);
		if (node) {
			node.dirtyController.runPostDirtyHooks(original_trigger_graph_node);
		}
	}
}
