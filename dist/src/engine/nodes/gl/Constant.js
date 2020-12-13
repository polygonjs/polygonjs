import {TypedGlNode} from "./_Base";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {GlConnectionPointType, GL_CONNECTION_POINT_TYPES} from "../utils/io/connections/Gl";
function typed_visible_options(type) {
  const val = GL_CONNECTION_POINT_TYPES.indexOf(type);
  return {visible_if: {type: val}};
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ConstantGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
      menu: {
        entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
          return {name, value: i};
        })
      }
    });
    this.bool = ParamConfig.BOOLEAN(0, typed_visible_options(GlConnectionPointType.BOOL));
    this.int = ParamConfig.INTEGER(0, typed_visible_options(GlConnectionPointType.INT));
    this.float = ParamConfig.FLOAT(0, typed_visible_options(GlConnectionPointType.FLOAT));
    this.vec2 = ParamConfig.VECTOR2([0, 0], typed_visible_options(GlConnectionPointType.VEC2));
    this.vec3 = ParamConfig.VECTOR3([0, 0, 0], typed_visible_options(GlConnectionPointType.VEC3));
    this.vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typed_visible_options(GlConnectionPointType.VEC4));
  }
}
const ParamsConfig2 = new ConstantGlParamsConfig();
const ConstantGlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._allow_inputs_created_from_params = false;
  }
  static type() {
    return "constant";
  }
  initialize_node() {
    this.io.connection_points.set_output_name_function((index) => ConstantGlNode2.OUTPUT_NAME);
    this.io.connection_points.set_expected_input_types_function(() => []);
    this.io.connection_points.set_expected_output_types_function(() => [this._current_connection_type]);
  }
  set_lines(shaders_collection_controller) {
    const param = this._current_param;
    if (param) {
      const connection_type = this._current_connection_type;
      const value = ThreeToGl2.any(param.value);
      const var_value = this._current_var_name;
      const body_line = `${connection_type} ${var_value} = ${value}`;
      shaders_collection_controller.add_body_lines(this, [body_line]);
    } else {
      console.warn(`no param found for constant node for type '${this.pv.type}'`);
    }
  }
  get _current_connection_type() {
    if (this.pv.type == null) {
      console.warn("constant gl node type if not valid");
    }
    const connection_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
    if (connection_type == null) {
      console.warn("constant gl node type if not valid");
    }
    return connection_type;
  }
  get _current_param() {
    this._params_by_type = this._params_by_type || new Map([
      [GlConnectionPointType.BOOL, this.p.bool],
      [GlConnectionPointType.INT, this.p.int],
      [GlConnectionPointType.FLOAT, this.p.float],
      [GlConnectionPointType.VEC2, this.p.vec2],
      [GlConnectionPointType.VEC3, this.p.vec3],
      [GlConnectionPointType.VEC4, this.p.vec4]
    ]);
    const connection_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
    return this._params_by_type.get(connection_type);
  }
  get _current_var_name() {
    return this.gl_var_name(ConstantGlNode2.OUTPUT_NAME);
  }
  set_gl_type(type) {
    this.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
  }
};
export let ConstantGlNode = ConstantGlNode2;
ConstantGlNode.OUTPUT_NAME = "val";
