// import {CoreGraphNode} from './CoreGraphNode';
// import { CoreGraphNodeScene } from './CoreGraphNodeScene';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

// interface CookerQueue {
// 	[propName: string]: CoreGraphNodeSceneNamed;
// }

export class Cooker {
	private _queue: Map<string, CoreGraphNode> = new Map<string, CoreGraphNode>();
	private _block_level: number = 0;
	private _process_item_bound = this._process_item.bind(this);

	constructor() {
		this._block_level = 0;
	}

	block() {
		this._block_level += 1;
	}
	unblock() {
		this._block_level -= 1;

		this.process_queue();
	}
	// unblock_later: ->
	// 	setTimeout( this.unblock.bind(this), 0 )
	get blocked() {
		return this._block_level > 0;
	}

	enqueue(node: CoreGraphNode) {
		this._queue.set(node.graph_node_id, node);
	}

	process_queue() {
		if (this.blocked) {
			return;
		}
		// let node: CoreGraphNode;
		// console.log('FLUSH', Object.keys(this._queue).length);

		this._queue.forEach(this._process_item_bound);
		// for (let id of Object.keys(this._queue)) {
		// 	node = this._queue[id];
		// 	if (node) {
		// 		delete this._queue[id];
		// 		node.dirty_controller.run_post_dirty_hooks();
		// 	}
		// }
	}
	private _process_item(node: CoreGraphNode, id: string) {
		if (node) {
			this._queue.delete(id);
			node.dirty_controller.run_post_dirty_hooks();
		}
	}
}
