import {BaseNodeType} from '../../_Base';
import lodash_compact from 'lodash/compact';
import {NodeConnection} from './NodeConnection';

// interface NodeConnectionByString {
// 	[propName: string]: NodeConnection;
// }
// interface NodeConnectionByStringByString {
// 	[propName: string]: NodeConnectionByString;
// }

export class ConnectionsController {
	private _input_connections: Array<NodeConnection | undefined> | undefined;
	private _output_connections: Map<number, Map<number, NodeConnection>> = new Map();

	constructor(protected _node: BaseNodeType) {}

	init_inputs() {
		const count = this._node.io.inputs.max_inputs_count;
		this._input_connections = new Array(count);
	}

	//
	//
	// INPUT CONNECTIONS
	//
	//
	add_input_connection(connection: NodeConnection) {
		if (this._input_connections) {
			if (connection.input_index < this._input_connections.length) {
				this._input_connections[connection.input_index] = connection;
			} else {
				console.warn(`attempt to add an input connection at index ${connection.input_index}`);
			}
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	remove_input_connection(connection: NodeConnection) {
		if (this._input_connections) {
			if (connection.input_index < this._input_connections.length) {
				this._input_connections[connection.input_index] = undefined;
			} else {
				console.warn(`attempt to remove an input connection at index ${connection.input_index}`);
			}
		} else {
			console.warn(`input connections array not initialized`);
		}
	}
	input_connection(index: number): NodeConnection | undefined {
		if (this._input_connections) {
			return this._input_connections[index];
		}
	}
	first_input_connection(): NodeConnection {
		return lodash_compact(this._input_connections)[0];
	}
	last_input_connection(): NodeConnection {
		const connections = lodash_compact(this._input_connections);
		return connections[connections.length - 1];
	}
	input_connections() {
		return this._input_connections;
	}

	//
	//
	// OUTPUT CONNECTIONS
	//
	//
	add_output_connection(connection: NodeConnection) {
		const output_index = connection.output_index;
		const id = connection.id;
		let connections_by_id = this._output_connections.get(output_index);
		if (!connections_by_id) {
			connections_by_id = new Map<number, NodeConnection>();
			this._output_connections.set(output_index, connections_by_id);
		}
		connections_by_id.set(id, connection);
		// this._output_connections[output_index] = this._output_connections[output_index] || {};
		// this._output_connections[output_index][id] = connection;
	}
	remove_output_connection(connection: NodeConnection) {
		const output_index = connection.output_index;
		const id = connection.id;
		let connections_by_id = this._output_connections.get(output_index);
		if (connections_by_id) {
			connections_by_id.delete(id);
		}
		// delete this._output_connections[output_index][id];
	}

	output_connections() {
		let list: NodeConnection[] = [];

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
