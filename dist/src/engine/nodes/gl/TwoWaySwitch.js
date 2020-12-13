import {ParamlessTypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
const OUTPUT_NAME = "val";
var InputName;
(function(InputName2) {
  InputName2["CONDITION"] = "condition";
  InputName2["IF_TRUE"] = "if_true";
  InputName2["IF_FALSE"] = "if_false";
})(InputName || (InputName = {}));
const InputNames = [InputName.CONDITION, InputName.IF_TRUE, InputName.IF_FALSE];
import {GlConnectionPointType} from "../utils/io/connections/Gl";
export class TwoWaySwitchGlNode extends ParamlessTypedGlNode {
  static type() {
    return "two_way_switch";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.initialize_node();
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
    this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
  }
  _gl_input_name(index) {
    return InputNames[index];
  }
  _gl_output_name() {
    return OUTPUT_NAME;
  }
  _expected_input_types() {
    const second_or_third_connection = this.io.connections.input_connection(1) || this.io.connections.input_connection(2);
    const type = second_or_third_connection ? second_or_third_connection.src_connection_point().type : GlConnectionPointType.FLOAT;
    return [GlConnectionPointType.BOOL, type, type];
  }
  _expected_output_types() {
    const type = this._expected_input_types()[1];
    return [type];
  }
  set_lines(shaders_collection_controller) {
    const body_lines = [];
    const value = this.gl_var_name(OUTPUT_NAME);
    const condition = ThreeToGl2.bool(this.variable_for_input(InputName.CONDITION));
    const if_true = ThreeToGl2.any(this.variable_for_input(InputName.IF_TRUE));
    const if_false = ThreeToGl2.any(this.variable_for_input(InputName.IF_FALSE));
    const gl_type = this._expected_output_types()[0];
    body_lines.push(`${gl_type} ${value}`);
    body_lines.push(`if(${condition}){`);
    body_lines.push(`${value} = ${if_true}`);
    body_lines.push(`} else {`);
    body_lines.push(`${value} = ${if_false}`);
    body_lines.push(`}`);
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
}
