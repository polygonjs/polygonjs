import {TypedGlNode} from "./_Base";
import {GlConnectionPoint, GlConnectionPointType} from "../utils/io/connections/Gl";
import {UniformGLDefinition} from "./utils/GLDefinition";
import {RampParam} from "../../params/Ramp";
import {ParamConfigsController as ParamConfigsController2} from "../utils/code/controllers/ParamConfigsController";
import {ParamType as ParamType2} from "../../poly/ParamType";
const OUTPUT_NAME = "val";
import {GlParamConfig} from "./code/utils/ParamConfig";
import {NodeParamsConfig, ParamConfig as ParamConfig2} from "../utils/params/ParamsConfig";
class RampGlParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig2.STRING("ramp");
    this.input = ParamConfig2.FLOAT(0);
  }
}
const ParamsConfig2 = new RampGlParamsConfig();
export class RampGlNode extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "ramp";
  }
  initialize_node() {
    super.initialize_node();
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile.bind(this));
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT)
    ]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name]);
      });
    });
  }
  set_lines(shaders_collection_controller) {
    const gl_type = GlConnectionPointType.FLOAT;
    const texture_name = this._uniform_name();
    const var_name = this.gl_var_name(OUTPUT_NAME);
    const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, texture_name);
    shaders_collection_controller.add_definitions(this, [definition]);
    const input_val = this.variable_for_input(this.p.input.name);
    const body_line = `${gl_type} ${var_name} = texture2D(${this._uniform_name()}, vec2(${input_val}, 0.0)).x`;
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
  set_param_configs() {
    this._param_configs_controller = this._param_configs_controller || new ParamConfigsController2();
    this._param_configs_controller.reset();
    const param_config = new GlParamConfig(ParamType2.RAMP, this.pv.name, RampParam.DEFAULT_VALUE, this._uniform_name());
    this._param_configs_controller.push(param_config);
  }
  _uniform_name() {
    return "ramp_texture_" + this.gl_var_name(OUTPUT_NAME);
  }
}
