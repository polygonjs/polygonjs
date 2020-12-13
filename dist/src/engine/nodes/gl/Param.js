import {TypedGlNode} from "./_Base";
import {
  GL_CONNECTION_POINT_TYPES,
  GlConnectionPointType,
  GlConnectionPointInitValueMap,
  GlConnectionPointTypeToParamTypeMap
} from "../utils/io/connections/Gl";
import lodash_isArray from "lodash/isArray";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {UniformGLDefinition} from "./utils/GLDefinition";
import {ParamConfigsController as ParamConfigsController2} from "../utils/code/controllers/ParamConfigsController";
import {GlParamConfig} from "./code/utils/ParamConfig";
class ParamGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING("");
    this.type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
      menu: {
        entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
          return {name, value: i};
        })
      }
    });
    this.as_color = ParamConfig.BOOLEAN(0, {
      visible_if: {type: GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.VEC3)}
    });
  }
}
const ParamsConfig2 = new ParamGlParamsConfig();
export class ParamGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._allow_inputs_created_from_params = false;
    this._on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
  }
  static type() {
    return "param";
  }
  initialize_node() {
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile.bind(this));
    this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
    this.io.connection_points.initialize_node();
    this.io.connection_points.set_expected_input_types_function(() => []);
    this.io.connection_points.set_expected_output_types_function(() => [GL_CONNECTION_POINT_TYPES[this.pv.type]]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name]);
      });
    });
  }
  set_lines(shaders_collection_controller) {
    const definitions = [];
    const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
    const var_name = this.uniform_name();
    definitions.push(new UniformGLDefinition(this, gl_type, var_name));
    shaders_collection_controller.add_definitions(this, definitions);
  }
  set_param_configs() {
    const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
    const default_value = GlConnectionPointInitValueMap[gl_type];
    let param_type = GlConnectionPointTypeToParamTypeMap[gl_type];
    this._param_configs_controller = this._param_configs_controller || new ParamConfigsController2();
    this._param_configs_controller.reset();
    if (param_type == ParamType2.VECTOR3 && this.p.as_color.value && lodash_isArray(default_value) && default_value.length == 3) {
      const param_config = new GlParamConfig(ParamType2.COLOR, this.pv.name, default_value, this.uniform_name());
      this._param_configs_controller.push(param_config);
    } else {
      const param_config = new GlParamConfig(param_type, this.pv.name, default_value, this.uniform_name());
      this._param_configs_controller.push(param_config);
    }
  }
  uniform_name() {
    const output_connection_point = this.io.outputs.named_output_connection_points[0];
    const var_name = this.gl_var_name(output_connection_point.name);
    return var_name;
  }
  set_gl_type(type) {
    const index = GL_CONNECTION_POINT_TYPES.indexOf(type);
    this.p.type.set(index);
  }
  _on_create_set_name_if_none() {
    if (this.pv.name == "") {
      this.p.name.set(this.name);
    }
  }
}
