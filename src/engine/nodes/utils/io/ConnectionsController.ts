import {TypedNodeConnection} from './NodeConnection';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {ArrayUtils} from '../../../../core/ArrayUtils';

export class ConnectionsController<NC extends NodeContext> {
	private _input_connections: Array<TypedNodeConnection<NC> | undefined> | undefined;
	private _output_connections: Map<number, Map<number, TypedNodeConnection<NC>>> = new Map();

	constructor(protected _node: TypedNode<NC, any>) {}

	initInputs() {
		const count = this._node.io.inputs.maxInputsCount();
		this._input_connections = this._input_connections || new Array(count);
		// adjust the array if this method is called more than once
		// which can be the case for nodes that have adjustable input counts
		// such as sop/merge
		while (this._input_connections.length < count) {
			this._input_connections.push(undefined);
		}
	}
	dispose() {
		if (this._input_connections) {
			this._input_connections.splice(0, this._input_connections.length);
		}
		if (this._output_connections) {
			this._output_connections.clear();
		}
	}

	//
	//
	// INPUT CONNECTIONS
	//
	//
	addInputConnection(connection: TypedNodeConnection<NC>) {
		if (this._input_connections) {
			// if (connection.input_index < this._input_connections.length) {
			this._input_connections[connection.input_index] = connection;
			// } else {
			// 	console.warn(`attempt to add an input connection at index ${connection.input_index}`);
			// }
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	removeInputConnection(connection: TypedNodeConnection<NC>) {
		if (this._input_connections) {
			if (connection.input_index < this._input_connections.length) {
				this._input_connections[connection.input_index] = undefined;
				// if all connections after are also undefined, we can safely shrink the array
				let all_connections_after_are_undefined = true;
				for (let i = connection.input_index; i < this._input_connections.length; i++) {
					if (this._input_connections[i]) {
						all_connections_after_are_undefined = false;
					}
				}
				if (all_connections_after_are_undefined) {
					this._input_connections = this._input_connections.slice(0, connection.input_index);
				}
			} else {
				console.warn(`attempt to remove an input connection at index ${connection.input_index}`);
			}
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	inputConnection(index: number): TypedNodeConnection<NC> | undefined {
		if (this._input_connections) {
			return this._input_connections[index];
		}
	}
	firstInputConnection(): TypedNodeConnection<NC> | null {
		if (this._input_connections) {
			return ArrayUtils.compact(this._input_connections)[0];
		} else {
			return null;
		}
	}
	inputConnections() {
		return this._input_connections;
	}
	existingInputConnections() {
		const current_connections = this._input_connections;
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
		const output_index = connection.output_index;
		const id = connection.id;
		let connections_by_id = this._output_connections.get(output_index);
		if (!connections_by_id) {
			connections_by_id = new Map<number, TypedNodeConnection<NC>>();
			this._output_connections.set(output_index, connections_by_id);
		}
		connections_by_id.set(id, connection);
		// this._output_connections[output_index] = this._output_connections[output_index] || {};
		// this._output_connections[output_index][id] = connection;
	}
	removeOutputConnection(connection: TypedNodeConnection<NC>) {
		const output_index = connection.output_index;
		const id = connection.id;
		let connections_by_id = this._output_connections.get(output_index);
		if (connections_by_id) {
			connections_by_id.delete(id);
		}
		// delete this._output_connections[output_index][id];
	}

	outputConnections() {
		let list: TypedNodeConnection<NC>[] = [];

		this._output_connections.forEach((connections_by_id, output_index) => {
			connections_by_id.forEach((connection, id) => {
				if (connection) {
					list.push(connection);
				}
			});
		});
		// Object.keys(this._output_connections).forEach((index) => {
		// 	const connections_for_index = this._output_connections[index];
		// 	Object.keys(connections_for_index).forEach((id) => {
		// 		list.push(connections_for_index[id]);
		// 	});
		// });
		return list;
	}
}
