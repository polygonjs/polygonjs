import lodash_isNumber from "lodash/isNumber";
import lodash_uniq from "lodash/uniq";
import lodash_isString from "lodash/isString";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
export class OutputsController {
  constructor(node) {
    this.node = node;
    this._has_outputs = false;
    this._has_named_outputs = false;
  }
  set_has_one_output() {
    this._has_outputs = true;
  }
  set_has_no_output() {
    this._has_outputs = false;
  }
  get has_outputs() {
    return this._has_outputs;
  }
  get has_named_outputs() {
    return this._has_named_outputs;
  }
  has_named_output(name) {
    return this.get_named_output_index(name) >= 0;
  }
  get named_output_connection_points() {
    return this._named_output_connection_points || [];
  }
  named_output_connection(index) {
    if (this._named_output_connection_points) {
      return this._named_output_connection_points[index];
    }
  }
  get_named_output_index(name) {
    if (this._named_output_connection_points) {
      for (let i = 0; i < this._named_output_connection_points.length; i++) {
        if (this._named_output_connection_points[i]?.name == name) {
          return i;
        }
      }
    }
    return -1;
  }
  get_output_index(output_index_or_name) {
    if (output_index_or_name != null) {
      if (lodash_isString(output_index_or_name)) {
        if (this.has_named_outputs) {
          return this.get_named_output_index(output_index_or_name);
        } else {
          console.warn(`node ${this.node.full_path()} has no named outputs`);
          return -1;
        }
      } else {
        return output_index_or_name;
      }
    }
    return -1;
  }
  named_output_connection_points_by_name(name) {
    if (this._named_output_connection_points) {
      for (let connection_point of this._named_output_connection_points) {
        if (connection_point?.name == name) {
          return connection_point;
        }
      }
    }
  }
  set_named_output_connection_points(connection_points, set_dirty = true) {
    this._has_named_outputs = true;
    const connections = this.node.io.connections.output_connections();
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          if (connection.output_index >= connection_points.length) {
            connection.disconnect({set_input: true});
          }
        }
      }
    }
    this._named_output_connection_points = connection_points;
    if (set_dirty && this.node.scene) {
      this.node.set_dirty(this.node);
    }
    this.node.emit(NodeEvent2.NAMED_OUTPUTS_UPDATED);
  }
  used_output_names() {
    const connections_controller = this.node.io.connections;
    if (connections_controller) {
      const output_connections = connections_controller.output_connections();
      let output_indices = output_connections.map((connection) => connection ? connection.output_index : null);
      output_indices = lodash_uniq(output_indices);
      const used_output_indices = [];
      output_indices.forEach((index) => {
        if (lodash_isNumber(index)) {
          used_output_indices.push(index);
        }
      });
      const used_output_names = [];
      for (let index of used_output_indices) {
        const name = this.named_output_connection_points[index]?.name;
        if (name) {
          used_output_names.push(name);
        }
      }
      return used_output_names;
    } else {
      return [];
    }
  }
}
