import {TypedNodeConnection} from './NodeConnection';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {arrayCompact} from '../../../../core/ArrayUtils';

export class ConnectionsController<NC extends NodeContext> {
	private _inputConnections: Array<TypedNodeConnection<NC> | undefined> | undefined;
	private _outputConnections: Map<number, Map<number, TypedNodeConnection<NC>>> = new Map();

	constructor(protected _node: TypedNode<NC, any>) {}

	initInputs() {
		const count = this._node.io.inputs.maxInputsCount();
		this._inputConnections = this._inputConnections || new Array(count);
		// adjust the array if this method is called more than once
		// which can be the case for nodes that have adjustable input counts
		// such as sop/merge
		while (this._inputConnections.length < count) {
			this._inputConnections.push(undefined);
		}
	}
	dispose() {
		if (this._inputConnections) {
			this._inputConnections.splice(0, this._inputConnections.length);
		}
		if (this._outputConnections) {
			this._outputConnections.clear();
		}
	}

	//
	//
	// INPUT CONNECTIONS
	//
	//
	addInputConnection(connection: TypedNodeConnection<NC>) {
		if (this._inputConnections) {
			// if (connection.input_index < this._input_connections.length) {
			this._inputConnections[connection.inputIndex()] = connection;
			// } else {
			// 	console.warn(`attempt to add an input connection at index ${connection.input_index}`);
			// }
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	removeInputConnection(connection: TypedNodeConnection<NC>) {
		if (this._inputConnections) {
			if (connection.inputIndex() < this._inputConnections.length) {
				this._inputConnections[connection.inputIndex()] = undefined;
				// if all connections after are also undefined, we can safely shrink the array
				let all_connections_after_are_undefined = true;
				for (let i = connection.inputIndex(); i < this._inputConnections.length; i++) {
					if (this._inputConnections[i]) {
						all_connections_after_are_undefined = false;
					}
				}
				if (all_connections_after_are_undefined) {
					this._inputConnections = this._inputConnections.slice(0, connection.inputIndex());
				}
			} else {
				console.warn(`attempt to remove an input connection at index ${connection.inputIndex()}`);
			}
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	inputConnection(index: number): TypedNodeConnection<NC> | undefined {
		if (this._inputConnections) {
			return this._inputConnections[index];
		}
	}
	firstInputConnection(): TypedNodeConnection<NC> | null {
		if (this._inputConnections) {
			return arrayCompact(this._inputConnections)[0];
		} else {
			return null;
		}
	}
	inputConnections() {
		return this._inputConnections;
	}
	existingInputConnections() {
		const current_connections = this._inputConnections;
		if (current_connections) {
			// remove the last one if it is undefined
			while (
				current_connections.length > 1 &&
				current_connections[current_connections.length - 1] === undefined
			) {
				current_connections.pop();
			}
		}
		return current_connections;
	}

	//
	//
	// OUTPUT CONNECTIONS
	//
	//
	addOutputConnection(connection: TypedNodeConnection<NC>) {
		const output_index = connection.outputIndex();
		const id = connection.id();
		let connections_by_id = this._outputConnections.get(output_index);
		if (!connections_by_id) {
			connections_by_id = new Map<number, TypedNodeConnection<NC>>();
			this._outputConnections.set(output_index, connections_by_id);
		}
		connections_by_id.set(id, connection);
		// this._output_connections[output_index] = this._output_connections[output_index] || {};
		// this._output_connections[output_index][id] = connection;
	}
	removeOutputConnection(connection: TypedNodeConnection<NC>) {
		const output_index = connection.outputIndex();
		const id = connection.id();
		let connections_by_id = this._outputConnections.get(output_index);
		if (connections_by_id) {
			connections_by_id.delete(id);
		}
		// delete this._output_connections[output_index][id];
	}
	outputConnectionsByOutputIndex(outputIndex: number) {
		return this._outputConnections.get(outputIndex);
	}

	outputConnections(target: TypedNodeConnection<NC>[]) {
		target.length = 0;
		this._outputConnections.forEach((connections_by_id, output_index) => {
			connections_by_id.forEach((connection, id) => {
				if (connection) {
					target.push(connection);
				}
			});
		});
		// Object.keys(this._output_connections).forEach((index) => {
		// 	const connections_for_index = this._output_connections[index];
		// 	Object.keys(connections_for_index).forEach((id) => {
		// 		list.push(connections_for_index[id]);
		// 	});
		// });
		return target;
	}
}
