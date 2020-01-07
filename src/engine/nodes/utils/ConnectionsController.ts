import {BaseNode} from '../_Base';
import lodash_last from 'lodash/last';
import lodash_compact from 'lodash/compact';
import {NodeConnection} from '../utils/NodeConnection';

// interface NodeConnectionByString {
// 	[propName: string]: NodeConnection;
// }
// interface NodeConnectionByStringByString {
// 	[propName: string]: NodeConnectionByString;
// }

export class ConnectionsController {

		private _input_connections: NodeConnection[] = [];
		private _output_connections: Dictionary<Dictionary<NodeConnection>> = {};

		constructor(protected _node: BaseNode){

		}

		add_input_connection(connection: NodeConnection) {
			this._input_connections[connection.input_index] = connection;
		}
		add_output_connection(connection: NodeConnection) {
			const output_index = connection.output_index;
			const uuid = connection.uuid;
			this._output_connections[output_index] = this._output_connections[output_index] || {};
			this._output_connections[output_index][uuid] = connection;
		}
		remove_input_connection(connection: NodeConnection) {
			this._input_connections[connection.input_index] = null;
		}
		remove_output_connection(connection: NodeConnection) {
			const output_index = connection.output_index;
			const uuid = connection.uuid;
			delete this._output_connections[output_index][uuid];
		}

		input_connection(index: number): NodeConnection {
			return this._input_connections[index];
		}
		first_input_connection(): NodeConnection {
			return lodash_compact(this._input_connections)[0];
		}
		last_input_connection(): NodeConnection {
			return lodash_last(lodash_compact(this._input_connections));
		}
		input_connections() {
			return this._input_connections;
		}
		output_connections() {
			let list: NodeConnection[] = [];
			Object.keys(this._output_connections).forEach((index) => {
				const connections_for_index = this._output_connections[index];
				Object.keys(connections_for_index).forEach((uuid) => {
					list.push(connections_for_index[uuid]);
				});
			});
			return list;
		}
	};
}
