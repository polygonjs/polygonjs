import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
import {ConnectionPointTypeMap} from './connections/ConnectionMap';
interface DisconnectionOptions {
	setInput?: boolean;
}

export class TypedNodeConnection<NC extends NodeContext> {
	private static _next_id: number = 0;
	private _id: number;

	constructor(
		private _node_src: TypedNode<NC, any>,
		private _node_dest: TypedNode<NC, any>,
		private _output_index: number = 0,
		private _input_index: number = 0
	) {
		if (this._output_index == null) {
			throw 'bad output index';
		}
		if (this._input_index == null) {
			throw 'bad input index';
		}

		this._id = TypedNodeConnection._next_id++;

		if (this._node_src.io.connections && this._node_dest.io.connections) {
			this._node_src.io.connections.addOutputConnection(this);
			this._node_dest.io.connections.addInputConnection(this);
		}
	}
	get id() {
		return this._id;
	}

	get node_src(): NodeTypeMap[NC] {
		return (<unknown>this._node_src) as NodeTypeMap[NC];
	}
	get node_dest(): NodeTypeMap[NC] {
		return (<unknown>this._node_dest) as NodeTypeMap[NC];
	}
	get output_index() {
		return this._output_index;
	}
	get input_index() {
		return this._input_index;
	}
	src_connection_point(): ConnectionPointTypeMap[NC] {
		const node_src = this._node_src;
		const output_index = this._output_index;
		return node_src.io.outputs.named_output_connection_points[output_index];
	}
	dest_connection_point(): ConnectionPointTypeMap[NC] {
		const node_dest = this._node_dest;
		const input_index = this._input_index;
		return node_dest.io.inputs.named_input_connection_points[input_index];
	}

	disconnect(options: DisconnectionOptions = {}) {
		if (this._node_src.io.connections && this._node_dest.io.connections) {
			this._node_src.io.connections.removeOutputConnection(this);
			this._node_dest.io.connections.removeInputConnection(this);
		}

		if (options.setInput === true) {
			this._node_dest.io.inputs.setInput(this._input_index, null);
		}
	}
}
