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
export const NODE_CONNECTION_TRIGGERED_EVENT = {type: NODE_CONNECTION_TRIGGERED_EVENT_NAME};

export class TypedNodeConnection<NC extends NodeContext> {
	private static _nextId: number = 0;
	private _id: number;

	constructor(
		private _nodeSrc: TypedNode<NC, any>,
		private _nodeDest: TypedNode<NC, any>,
		private _outputIndex: number = 0,
		private _inputIndex: number = 0
	) {
		if (this._outputIndex == null) {
			throw 'bad output index';
		}
		if (this._inputIndex == null) {
			throw 'bad input index';
		}

		this._id = TypedNodeConnection._nextId++;

		if (this._nodeSrc.io.connections && this._nodeDest.io.connections) {
			this._nodeSrc.io.connections.addOutputConnection(this);
			this._nodeDest.io.connections.addInputConnection(this);
		}
	}
	id() {
		return this._id;
	}

	nodeSrc(): BaseNodeByContextMap[NC] {
		return (<unknown>this._nodeSrc) as BaseNodeByContextMap[NC];
	}
	nodeDest(): BaseNodeByContextMap[NC] {
		return (<unknown>this._nodeDest) as BaseNodeByContextMap[NC];
	}
	outputIndex() {
		return this._outputIndex;
	}
	inputIndex() {
		return this._inputIndex;
	}
	srcConnectionPoint(): ConnectionPointTypeMap[NC] {
		const nodeSrc = this._nodeSrc;
		const outputIndex = this._outputIndex;
		return nodeSrc.io.outputs.namedOutputConnectionPoints()[outputIndex];
	}
	destConnectionPoint(): ConnectionPointTypeMap[NC] {
		const nodeDest = this._nodeDest;
		const inputIndex = this._inputIndex;
		return nodeDest.io.inputs.namedInputConnectionPoints()[inputIndex];
	}

	disconnect(options: DisconnectionOptions = {}) {
		if (this._nodeSrc.io.connections && this._nodeDest.io.connections) {
			this._nodeSrc.io.connections.removeOutputConnection(this);
			this._nodeDest.io.connections.removeInputConnection(this);
		}

		if (options.setInput === true) {
			this._nodeDest.io.inputs.setInput(this._inputIndex, null, undefined, {
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
