import {BaseNodeGlMathFunctionArg1GlNode} from "./_BaseMathFunction";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
export class NullGlNode extends BaseNodeGlMathFunctionArg1GlNode {
  static type() {
    return "null";
  }
  set_lines(shaders_collection_controller) {
    const in_value = ThreeToGl2.any(this.variable_for_input(this._gl_input_name(0)));
    const out_connection_point = this.io.outputs.named_output_connection_points[0];
    const gl_type = out_connection_point.type;
    const out = this.gl_var_name(out_connection_point.name);
    const body_line = `${gl_type} ${out} = ${in_value}`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}
