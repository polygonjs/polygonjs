// import {CoreGraphNode} from './CoreGraphNode';
// import { CoreGraphNodeScene } from './CoreGraphNodeScene';
import {BaseNode} from 'src/engine/nodes/_Base';

// interface CookerQueue {
// 	[propName: string]: CoreGraphNodeSceneNamed;
// }

export class Cooker {
	_queue: Dictionary<BaseNode> = {};
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
	blocked() {
		return this._block_level > 0;
	}

	enqueue(node: BaseNode) {
		this._queue[node.graph_node_id] = node;
	}

	process_queue() {
		if (this.blocked()) {
			return;
		}

		let node: BaseNode;
		for (let id of Object.keys(this._queue)) {
			node = this._queue[id];
			if (node) {
				delete this._queue[id];
				node.container_controller.process_container_request();
			}
		}
	}
}
