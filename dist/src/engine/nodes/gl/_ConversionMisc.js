import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
const OUTPUT_NAME_INT = "int";
class FloatToIntGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.float = ParamConfig.FLOAT(0);
  }
}
const ParamsConfigFloatToInt = new FloatToIntGlParamsConfig();
export class FloatToIntGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfigFloatToInt;
  }
  static type() {
    return "float_to_int";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME_INT, GlConnectionPointType.INT)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const float = this.variable_for_input("float");
    const int = this.gl_var_name("int");
    const body_line = `int ${int} = int(${ThreeToGl2.float(float)})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}
const OUTPUT_NAME_FLOAT = "float";
class IntToFloatGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.int = ParamConfig.INTEGER(0);
  }
}
const ParamsConfigIntToFloat = new IntToFloatGlParamsConfig();
export class IntToFloatGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfigIntToFloat;
  }
  static type() {
    return "int_to_float";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME_FLOAT, GlConnectionPointType.FLOAT)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const int = this.variable_for_input("int");
    const float = this.gl_var_name("float");
    const body_line = `float ${float} = float(${ThreeToGl2.int(int)})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
}
