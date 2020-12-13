import lodash_range from "lodash/range";
import lodash_compact from "lodash/compact";
import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {GlConnectionPointType} from "../utils/io/connections/Gl";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
export class BaseGlMathFunctionParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new BaseGlMathFunctionParamsConfig();
export class BaseGlMathFunctionGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  gl_method_name() {
    return "";
  }
  gl_function_definitions() {
    return [];
  }
  initialize_node() {
    super.initialize_node();
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
  }
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    if (this.io.connections.first_input_connection()) {
      let count = Math.max(lodash_compact(this.io.connections.input_connections()).length + 1, 2);
      return lodash_range(count).map((i) => type);
    } else {
      return lodash_range(2).map((i) => type);
    }
  }
  _expected_output_types() {
    const type = this._expected_input_types()[0];
    return [type];
  }
  _gl_input_name(index) {
    return "in";
  }
  set_lines(shaders_collection_controller) {
    const var_type = this.io.outputs.named_output_connection_points[0].type;
    const args = this.io.inputs.named_input_connection_points.map((connection, i) => {
      const name = connection.name;
      return ThreeToGl2.any(this.variable_for_input(name));
    });
    const joined_args = args.join(", ");
    const sum = this.gl_var_name(this.io.connection_points.output_name(0));
    const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
    shaders_collection_controller.add_definitions(this, this.gl_function_definitions());
  }
}
export class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
  _gl_input_name(index) {
    return "in";
  }
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type];
  }
}
export class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type, type];
  }
}
export class BaseNodeGlMathFunctionArg3GlNode extends BaseGlMathFunctionGlNode {
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type, type, type];
  }
}
export class BaseNodeGlMathFunctionArg4GlNode extends BaseGlMathFunctionGlNode {
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type, type, type, type];
  }
}
export class BaseNodeGlMathFunctionArg5GlNode extends BaseGlMathFunctionGlNode {
  _expected_input_types() {
    const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
    return [type, type, type, type, type];
  }
}
