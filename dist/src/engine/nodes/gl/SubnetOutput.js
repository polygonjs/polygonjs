import {TypedGlNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {NetworkChildNodeType} from "../../poly/NodeContext";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
class SubnetOutputGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SubnetOutputGlParamsConfig();
export class SubnetOutputGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return NetworkChildNodeType.OUTPUT;
  }
  initialize_node() {
    this.io.connection_points.set_input_name_function(this._expected_input_name.bind(this));
    this.io.connection_points.set_expected_output_types_function(() => []);
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_create_spare_params_from_inputs(false);
    this.add_post_dirty_hook("set_parent_dirty", () => {
      this.parent?.set_dirty(this);
    });
  }
  get parent() {
    return super.parent;
  }
  _expected_input_name(index) {
    const parent = this.parent;
    return parent?.child_expected_output_connection_point_name(index) || `in${index}`;
  }
  _expected_input_types() {
    const parent = this.parent;
    return parent?.child_expected_output_connection_point_types() || [];
  }
  set_lines(shaders_collection_controller) {
    if (!this.parent) {
      return;
    }
    const body_lines = [];
    const connections = this.io.connections.input_connections();
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          const connection_point = connection.dest_connection_point();
          const in_value = ThreeToGl2.any(this.variable_for_input(connection_point.name));
          const out = this.parent.gl_var_name(connection_point.name);
          const body_line = `	${out} = ${in_value}`;
          body_lines.push(body_line);
        }
      }
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
    this.parent.set_lines_block_end(shaders_collection_controller, this);
  }
}
