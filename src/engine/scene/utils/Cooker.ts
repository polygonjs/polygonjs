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
	private _block_level: number = 0;
	private _process_item_bound = this._process_item.bind(this);

	constructor(private _scene: PolyScene) {
		this._block_level = 0;
	}

	block() {
		this._block_level += 1;
	}
	unblock() {
		this._block_level -= 1;
		if (this._block_level < 0) {
			this._block_level = 0;
		}

		this.process_queue();
	}
	// unblock_later: ->
	// 	setTimeout( this.unblock.bind(this), 0 )
	get blocked() {
		return this._block_level > 0;
	}

	enqueue(node: CoreGraphNode, original_trigger_graph_node?: CoreGraphNode) {
		this._queue.set(node.graph_node_id, original_trigger_graph_node);
	}

	process_queue() {
		if (this.blocked) {
			return;
		}
		// let node: CoreGraphNode;
		// console.warn('FLUSH', Object.keys(this._queue).length);

		this._queue.forEach(this._process_item_bound);
		// for (let id of Object.keys(this._queue)) {
		// 	node = this._queue[id];
		// 	if (node) {
		// 		delete this._queue[id];
		// 		node.dirty_controller.run_post_dirty_hooks();
		// 	}
		// }
	}
	private _process_item(original_trigger_graph_node: CoreGraphNode | undefined, id: CoreGraphNodeId) {
		const node = this._scene.graph.node_from_id(id);
		if (node) {
			this._queue.delete(id);
			node.dirty_controller.run_post_dirty_hooks(original_trigger_graph_node);
		}
	}
}
