import {SubnetGlNode} from "./Subnet";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
const CONDITION_INPUT_NAME = "condition";
class IfThenGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new IfThenGlParamsConfig();
export class IfThenGlNode extends SubnetGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "if_then";
  }
  _expected_inputs_count() {
    const current_connections = this.io.connections.input_connections();
    return current_connections ? Math.max(current_connections.length + 1, 2) : 2;
  }
  _expected_input_types() {
    const types = [GlConnectionPointType.BOOL];
    const default_type = GlConnectionPointType.FLOAT;
    const current_connections = this.io.connections.input_connections();
    const expected_count = this._expected_inputs_count();
    for (let i = 1; i < expected_count; i++) {
      if (current_connections) {
        const connection = current_connections[i];
        if (connection) {
          const type = connection.src_connection_point().type;
          types.push(type);
        } else {
          types.push(default_type);
        }
      } else {
        types.push(default_type);
      }
    }
    return types;
  }
  _expected_output_types() {
    const types = [];
    const input_types = this._expected_input_types();
    for (let i = 1; i < input_types.length; i++) {
      types.push(input_types[i]);
    }
    return types;
  }
  _expected_input_name(index) {
    if (index == 0) {
      return CONDITION_INPUT_NAME;
    } else {
      const connection = this.io.connections.input_connection(index);
      if (connection) {
        const name = connection.src_connection_point().name;
        return name;
      } else {
        return `in${index}`;
      }
    }
  }
  _expected_output_name(index) {
    return this._expected_input_name(index + 1);
  }
  child_expected_input_connection_point_types() {
    return this._expected_output_types();
  }
  child_expected_input_connection_point_name(index) {
    return this._expected_output_name(index);
  }
  child_expected_output_connection_point_types() {
    return this._expected_output_types();
  }
  child_expected_output_connection_point_name(index) {
    return this._expected_output_name(index);
  }
  set_lines_block_start(shaders_collection_controller, child_node) {
    const body_lines = [];
    const connection_points = this.io.inputs.named_input_connection_points;
    for (let i = 1; i < connection_points.length; i++) {
      const connection_point = connection_points[i];
      const gl_type = connection_point.type;
      const out = this.gl_var_name(connection_point.name);
      const in_value = ThreeToGl2.any(this.variable_for_input(connection_point.name));
      const body_line = `${gl_type} ${out} = ${in_value}`;
      body_lines.push(body_line);
    }
    const condition_value = ThreeToGl2.any(this.variable_for_input(CONDITION_INPUT_NAME));
    const open_if_line = `if(${condition_value}){`;
    body_lines.push(open_if_line);
    const connections = this.io.connections.input_connections();
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          if (connection.input_index != 0) {
            const connection_point = connection.dest_connection_point();
            const in_value = ThreeToGl2.any(this.variable_for_input(connection_point.name));
            const gl_type = connection_point.type;
            const out = child_node.gl_var_name(connection_point.name);
            const body_line = `	${gl_type} ${out} = ${in_value}`;
            body_lines.push(body_line);
          }
        }
      }
    }
    shaders_collection_controller.add_body_lines(child_node, body_lines);
  }
  set_lines(shaders_collection_controller) {
  }
}
