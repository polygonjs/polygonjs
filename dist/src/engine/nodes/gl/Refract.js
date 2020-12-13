import {BaseGlMathFunctionGlNode} from "./_BaseMathFunction";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
export class RefractGlNode extends BaseGlMathFunctionGlNode {
  static type() {
    return "refract";
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_input_name_function((index) => ["I", "N", "eta"][index]);
    this.io.connection_points.set_output_name_function((index) => "refract");
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
  }
  gl_method_name() {
    return "refract";
  }
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
    return [type, type, GlConnectionPointType.FLOAT];
  }
  _expected_output_types() {
    const type = this._expected_input_types()[0];
    return [type];
  }
}
