import {TypedSubnetGlNode} from "./Subnet";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
var ForLoopInput;
(function(ForLoopInput2) {
  ForLoopInput2["START_INDEX"] = "i";
  ForLoopInput2["MAX"] = "max";
  ForLoopInput2["STEP"] = "step";
})(ForLoopInput || (ForLoopInput = {}));
const DEFAULT_VALUES = {
  [ForLoopInput.START_INDEX]: 0,
  [ForLoopInput.MAX]: 10,
  [ForLoopInput.STEP]: 1
};
const OFFSET = 0;
class ForLoopGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.start = ParamConfig.FLOAT(0);
    this.max = ParamConfig.FLOAT(10, {
      range: [0, 100],
      range_locked: [false, false]
    });
    this.step = ParamConfig.FLOAT(1);
  }
}
const ParamsConfig2 = new ForLoopGlParamsConfig();
export class ForLoopGlNode extends TypedSubnetGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "for_loop";
  }
  param_default_value(name) {
    return DEFAULT_VALUES[name];
  }
  _expected_inputs_count() {
    const current_connections = this.io.connections.input_connections();
    return current_connections ? current_connections.length + 1 : 1;
  }
  _expected_input_types() {
    const types = [];
    const default_type = GlConnectionPointType.FLOAT;
    const current_connections = this.io.connections.input_connections();
    const expected_count = this._expected_inputs_count();
    for (let i = OFFSET; i < expected_count; i++) {
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
    for (let i = OFFSET; i < input_types.length; i++) {
      types.push(input_types[i]);
    }
    return types;
  }
  _expected_input_name(index) {
    const connection = this.io.connections.input_connection(index);
    if (connection) {
      const name = connection.src_connection_point().name;
      return name;
    } else {
      return `in${index}`;
    }
  }
  _expected_output_name(index) {
    return this._expected_input_name(index + OFFSET);
  }
  child_expected_input_connection_point_types() {
    return this._expected_input_types();
  }
  child_expected_input_connection_point_name(index) {
    return this._expected_input_name(index);
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
    for (let i = OFFSET; i < connection_points.length; i++) {
      const connection_point = connection_points[i];
      const gl_type = connection_point.type;
      const out2 = this.gl_var_name(connection_point.name);
      const in_value = ThreeToGl2.any(this.variable_for_input(connection_point.name));
      const body_line2 = `${gl_type} ${out2} = ${in_value}`;
      body_lines.push(body_line2);
    }
    const connections = this.io.connections.input_connections();
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          if (connection.input_index >= OFFSET) {
            const connection_point = connection.dest_connection_point();
            const in_value = ThreeToGl2.any(this.variable_for_input(connection_point.name));
            const gl_type = connection_point.type;
            const out2 = this.gl_var_name(connection_point.name);
            const body_line2 = `${gl_type} ${out2} = ${in_value}`;
            body_lines.push(body_line2);
          }
        }
      }
    }
    const start = this.pv.start;
    const max = this.pv.max;
    const step = this.pv.step;
    const start_str = ThreeToGl2.float(start);
    const max_str = ThreeToGl2.float(max);
    const step_str = ThreeToGl2.float(step);
    const iterator_name = this.gl_var_name("i");
    const open_for_loop_line = `for(float ${iterator_name} = ${start_str}; ${iterator_name} < ${max_str}; ${iterator_name}+= ${step_str}){`;
    body_lines.push(open_for_loop_line);
    const out = child_node.gl_var_name(ForLoopInput.START_INDEX);
    const body_line = `	float ${out} = ${iterator_name}`;
    body_lines.push(body_line);
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          if (connection.input_index >= OFFSET) {
            const connection_point = connection.dest_connection_point();
            const in_value = this.gl_var_name(connection_point.name);
            const gl_type = connection_point.type;
            const out2 = child_node.gl_var_name(connection_point.name);
            const body_line2 = `	${gl_type} ${out2} = ${in_value}`;
            body_lines.push(body_line2);
          }
        }
      }
    }
    shaders_collection_controller.add_body_lines(child_node, body_lines);
  }
  set_lines(shaders_collection_controller) {
  }
}
