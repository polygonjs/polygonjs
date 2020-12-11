import {BaseNodeGlMathFunctionArg1GlNode} from "./_BaseMathFunction";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {GlConnectionPointComponentsCountMap} from "../utils/io/connections/Gl";
const ALL_COMPONENTS = ["x", "y", "z", "w"];
export class RoundGlNode extends BaseNodeGlMathFunctionArg1GlNode {
  static type() {
    return "round";
  }
  set_lines(shaders_collection_controller) {
    const input_connection = this.io.inputs.named_input_connection_points[0];
    const value = ThreeToGl2.vector2(this.variable_for_input(input_connection.name));
    const output_connection = this.io.outputs.named_output_connection_points[0];
    const var_name = this.gl_var_name(output_connection.name);
    const body_lines = [];
    const lines_count = GlConnectionPointComponentsCountMap[output_connection.type];
    if (lines_count == 1) {
      body_lines.push(`${output_connection.type} ${var_name} = ${this._simple_line(value)}`);
    } else {
      const simple_lines = ALL_COMPONENTS.map((c) => {
        return this._simple_line(`${value}.${c}`);
      });
      body_lines.push(`${output_connection.type} ${var_name} = ${output_connection.type}(${simple_lines.join(",")})`);
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
  _simple_line(value) {
    return `sign(${value})*floor(abs(${value})+0.5)`;
  }
}
