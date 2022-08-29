import {EventDispatcher} from 'three';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
// import {NodeTypeMap} from '../../../containers/utils/ContainerMap';
import {ConnectionPointTypeMap} from './connections/ConnectionMap';
interface DisconnectionOptions {
	setInput?: boolean;
	ignoreLockedState?: boolean;
}
export const NODE_CONNECTION_TRIGGERED_EVENT_NAME = 'triggered';
// export const NODE_CONNECTION_UNTRIGGERED_EVENT_NAME = 'untriggered';
export const NODE_CONNECTION_TRIGGERED_EVENT = {type: NODE_CONNECTION_TRIGGERED_EVENT_NAME};
// export const NODE_CONNECTION_UNTRIGGERED_EVENT = {type: NODE_CONNECTION_UNTRIGGERED_EVENT_NAME};

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

	get node_src(): BaseNodeByContextMap[NC] {
		return (<unknown>this._node_src) as BaseNodeByContextMap[NC];
	}
	get node_dest(): BaseNodeByContextMap[NC] {
		return (<unknown>this._node_dest) as BaseNodeByContextMap[NC];
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
		return node_src.io.outputs.namedOutputConnectionPoints()[output_index];
	}
	dest_connection_point(): ConnectionPointTypeMap[NC] {
		const node_dest = this._node_dest;
		const input_index = this._input_index;
		return node_dest.io.inputs.namedInputConnectionPoints()[input_index];
	}

	disconnect(options: DisconnectionOptions = {}) {
		if (this._node_src.io.connections && this._node_dest.io.connections) {
			this._node_src.io.connections.removeOutputConnection(this);
			this._node_dest.io.connections.removeInputConnection(this);
		}

		if (options.setInput === true) {
			this._node_dest.io.inputs.setInput(this._input_index, null, undefined, {
				ignoreLockedState: options.ignoreLockedState,
			});
		}
	}

	// observer
	private __eventDispatcher: EventDispatcher | undefined;
	_eventDispatcher() {
		return this.__eventDispatcher;
	}
	eventDispatcher() {
		return (this.__eventDispatcher = this.__eventDispatcher || new EventDispatcher());
	}
}
