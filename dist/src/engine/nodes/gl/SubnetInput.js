import {TypedGlNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {NetworkChildNodeType} from "../../poly/NodeContext";
class SubnetInputGlParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SubnetInputGlParamsConfig();
export class SubnetInputGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return NetworkChildNodeType.INPUT;
  }
  initialize_node() {
    this.io.connection_points.set_output_name_function(this._expected_output_names.bind(this));
    this.io.connection_points.set_expected_input_types_function(() => []);
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
  }
  get parent() {
    return super.parent;
  }
  _expected_output_names(index) {
    const parent = this.parent;
    return parent?.child_expected_input_connection_point_name(index) || `out${index}`;
  }
  _expected_output_types() {
    const parent = this.parent;
    return parent?.child_expected_input_connection_point_types() || [];
  }
  set_lines(shaders_collection_controller) {
    if (!this.parent) {
      return;
    }
    this.parent.set_lines_block_start(shaders_collection_controller, this);
  }
}
