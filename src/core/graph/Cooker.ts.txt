interface CookerQueue {
	[propName: string]: any
}

export class Cooker {
	_queue: CookerQueue = {}
	_block_level: number = 0

	constructor() {
		this._queue = {}
		this._block_level = 0
	}

	block() {
		this._block_level += 1
	}
	unblock() {
		this._block_level -= 1

		this.process_queue()
	}
	// unblock_later: ->
	// 	setTimeout( this.unblock.bind(this), 0 )
	blocked() {
		return this._block_level > 0
	}

	enqueue(graph_node: any) {
		this._queue[graph_node.graph_node_id()] = graph_node
	}

	process_queue() {
		if (this.blocked()) {
			return
		}

		Object.keys(this._queue).forEach((graph_node_id) => {
			let graph_node
			if ((graph_node = this._queue[graph_node_id]) != null) {
				delete this._queue[graph_node_id]
				graph_node.process_container_request()
			}
		})
	}
}
