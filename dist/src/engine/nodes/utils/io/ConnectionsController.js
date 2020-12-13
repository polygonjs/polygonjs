import lodash_compact from "lodash/compact";
export class ConnectionsController {
  constructor(_node) {
    this._node = _node;
    this._output_connections = new Map();
  }
  init_inputs() {
    const count = this._node.io.inputs.max_inputs_count;
    this._input_connections = new Array(count);
  }
  add_input_connection(connection) {
    if (this._input_connections) {
      this._input_connections[connection.input_index] = connection;
    } else {
      console.warn(`input connections array not initialized`);
    }
  }
  remove_input_connection(connection) {
    if (this._input_connections) {
      if (connection.input_index < this._input_connections.length) {
        this._input_connections[connection.input_index] = void 0;
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
  input_connection(index) {
    if (this._input_connections) {
      return this._input_connections[index];
    }
  }
  first_input_connection() {
    return lodash_compact(this._input_connections)[0];
  }
  input_connections() {
    return this._input_connections;
  }
  add_output_connection(connection) {
    const output_index = connection.output_index;
    const id = connection.id;
    let connections_by_id = this._output_connections.get(output_index);
    if (!connections_by_id) {
      connections_by_id = new Map();
      this._output_connections.set(output_index, connections_by_id);
    }
    connections_by_id.set(id, connection);
  }
  remove_output_connection(connection) {
    const output_index = connection.output_index;
    const id = connection.id;
    let connections_by_id = this._output_connections.get(output_index);
    if (connections_by_id) {
      connections_by_id.delete(id);
    }
  }
  output_connections() {
    let list = [];
    this._output_connections.forEach((connections_by_id, output_index) => {
      connections_by_id.forEach((connection, id) => {
        if (connection) {
          list.push(connection);
        }
      });
    });
    return list;
  }
}
