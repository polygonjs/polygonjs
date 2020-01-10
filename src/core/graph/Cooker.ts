import {CoreGraphNode} from './CoreGraphNode';

interface CookerQueue {
	[propName: string]: any;
}

export class Cooker {
	_queue: CookerQueue = {};
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

	enqueue(graph_node: CoreGraphNode) {
		this._queue[graph_node.id] = graph_node;
	}

	process_queue() {
		if (this.blocked()) {
			return;
		}

		let graph_node: CoreGraphNode;
		for (let id of Object.keys(this._queue)) {
			graph_node = this._queue[id];
			if (graph_node) {
				delete this._queue[id];
				graph_node.process_container_request();
			}
		}
	}
}
