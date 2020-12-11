import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
export class TypedJsNode extends TypedNode {
  static node_context() {
    return NodeContext2.JS;
  }
  initialize_base_node() {
    this.ui_data.set_layout_horizontal();
    this.io.connection_points.initialize_node();
  }
  cook() {
    console.warn("js nodes should never cook");
  }
  _set_function_node_to_recompile() {
    this.function_node?.assembler_controller.set_compilation_required_and_dirty(this);
  }
  get function_node() {
    if (this.parent) {
      if (this.parent.type == this.type) {
        return this.parent?.function_node;
      } else {
        return this.parent;
      }
    }
  }
  js_var_name(name) {
    return `v_POLY_${this.name}_${name}`;
  }
  variable_for_input(name) {
    const input_index = this.io.inputs.get_input_index(name);
    const connection = this.io.connections.input_connection(input_index);
    if (connection) {
      const input_node = connection.node_src;
      const output_connection_point = input_node.io.outputs.named_output_connection_points[connection.output_index];
      if (output_connection_point) {
        const output_name = output_connection_point.name;
        return input_node.js_var_name(output_name);
      } else {
        console.warn(`no output called '${name}' for gl node ${input_node.full_path()}`);
        throw "variable_for_input ERROR";
      }
    } else {
      return "to debug...";
    }
  }
  set_lines(lines_controller) {
  }
  reset_code() {
    this._param_configs_controller?.reset();
  }
  set_param_configs() {
  }
  param_configs() {
    return this._param_configs_controller?.list;
  }
  js_input_default_value(name) {
    return null;
  }
}
export class BaseJsNodeClass extends TypedJsNode {
}
class ParamlessParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new ParamlessParamsConfig();
export class ParamlessTypedJsNode extends TypedJsNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
}
