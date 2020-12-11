import {TypedNode} from "../_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
const REGEX_PATH_SANITIZE = /\/+/g;
export class TypedGlNode extends TypedNode {
  static node_context() {
    return NodeContext2.GL;
  }
  initialize_base_node() {
    this.ui_data.set_layout_horizontal();
    this.io.connections.init_inputs();
    this.io.connection_points.spare_params.initialize_node();
  }
  cook() {
    console.warn("gl nodes should never cook");
  }
  _set_mat_to_recompile() {
    this.material_node?.assembler_controller?.set_compilation_required_and_dirty(this);
  }
  get material_node() {
    if (this.parent) {
      if (this.parent.node_context() == NodeContext2.GL) {
        return this.parent?.material_node;
      } else {
        return this.parent;
      }
    }
  }
  gl_var_name(name) {
    const path_sanitized = this.full_path(this.material_node).replace(REGEX_PATH_SANITIZE, "_");
    return `v_POLY_${path_sanitized}_${name}`;
  }
  variable_for_input(name) {
    const input_index = this.io.inputs.get_input_index(name);
    const connection = this.io.connections.input_connection(input_index);
    if (connection) {
      const input_node = connection.node_src;
      const output_connection_point = input_node.io.outputs.named_output_connection_points[connection.output_index];
      if (output_connection_point) {
        const output_name = output_connection_point.name;
        return input_node.gl_var_name(output_name);
      } else {
        console.warn(`no output called '${name}' for gl node ${input_node.full_path()}`);
        throw "variable_for_input ERROR";
      }
    } else {
      if (this.params.has(name)) {
        return ThreeToGl2.any(this.params.get(name)?.value);
      } else {
        const connection_point = this.io.inputs.named_input_connection_points[input_index];
        return ThreeToGl2.any(connection_point.init_value);
      }
    }
  }
  set_lines(shaders_collection_controller) {
  }
  reset_code() {
    this._param_configs_controller?.reset();
  }
  set_param_configs() {
  }
  param_configs() {
    return this._param_configs_controller?.list;
  }
  param_default_value(name) {
    return null;
  }
}
export class BaseGlNodeClass extends TypedGlNode {
}
class ParamlessParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new ParamlessParamsConfig();
export class ParamlessTypedGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
}
