import {BaseNodeType} from '../../_Base';

interface DisconnectionOptions {
	set_input?: boolean;
}

export class NodeConnection {
	private static _next_id: number = 0;
	private _id: number;

	constructor(
		private _node_src: BaseNodeType,
		private _node_dest: BaseNodeType,
		private _output_index: number = 0,
		private _input_index: number = 0
	) {
		this._id = NodeConnection._next_id++;

		if (this._node_src.io.connections && this._node_dest.io.connections) {
			this._node_src.io.connections.add_output_connection(this);
			this._node_dest.io.connections.add_input_connection(this);
		}
	}
	get id() {
		return this._id;
	}

	get node_src() {
		return this._node_src;
	}
	get node_dest() {
		return this._node_dest;
	}
	get output_index() {
		return this._output_index;
	}
	get input_index() {
		return this._input_index;
	}

	disconnect(options: DisconnectionOptions = {}) {
		if (this._node_src.io.connections && this._node_dest.io.connections) {
			this._node_src.io.connections.remove_output_connection(this);
			this._node_dest.io.connections.remove_input_connection(this);
		}

		if (options.set_input === true) {
			this._node_dest.io.inputs.set_input(this._input_index, null);
		}
	}
}
