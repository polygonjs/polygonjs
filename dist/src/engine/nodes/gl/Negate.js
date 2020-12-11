import {BaseNodeGlMathFunctionArg1GlNode} from "./_BaseMathFunction";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
export class NegateGlNode extends BaseNodeGlMathFunctionArg1GlNode {
  static type() {
    return "negate";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_input_name_function((index) => ["in"][index]);
  }
  _gl_input_name(index) {
    return ["in"][index];
  }
  set_lines(shaders_collection_controller) {
    const in_value = ThreeToGl2.any(this.variable_for_input(this._gl_input_name(0)));
    const gl_type = this.io.inputs.named_input_connection_points[0].type;
    const out = this.gl_var_name(this.io.connection_points.output_name(0));
    const body_line = `${gl_type} ${out} = -1.0 * ${in_value}`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}
