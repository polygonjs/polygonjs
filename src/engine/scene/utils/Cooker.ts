// import {CoreGraphNode} from './CoreGraphNode';
// import { CoreGraphNodeScene } from './CoreGraphNodeScene';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

// interface CookerQueue {
// 	[propName: string]: CoreGraphNodeSceneNamed;
// }

export class Cooker {
	_queue: Dictionary<CoreGraphNode> = {};
	_block_level: number = 0;

	constructor() {
		this._queue = {};
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
		this._queue[node.graph_node_id] = node;
	}

	process_queue() {
		if (this.blocked) {
			return;
		}
		let node: CoreGraphNode;
		for (let id of Object.keys(this._queue)) {
			node = this._queue[id];
			if (node) {
				delete this._queue[id];
				node.dirty_controller.run_post_dirty_hooks();
			}
		}
	}
}
