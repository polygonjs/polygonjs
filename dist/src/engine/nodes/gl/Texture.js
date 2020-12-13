import {TypedGlNode} from "./_Base";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
import {UniformGLDefinition} from "./utils/GLDefinition";
import {ParamConfigsController as ParamConfigsController2} from "../utils/code/controllers/ParamConfigsController";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {GlParamConfig} from "./code/utils/ParamConfig";
import {OPERATOR_PATH_DEFAULT} from "../../params/OperatorPath";
class TextureParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.param_name = ParamConfig.STRING("texture_map");
    this.default_value = ParamConfig.STRING(OPERATOR_PATH_DEFAULT.NODE.UV);
    this.uv = ParamConfig.VECTOR2([0, 0]);
  }
}
const ParamsConfig2 = new TextureParamsConfig();
const TextureGlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "texture";
  }
  initialize_node() {
    this.add_post_dirty_hook("_set_mat_to_recompile", this._set_mat_to_recompile.bind(this));
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(TextureGlNode2.OUTPUT_NAME, GlConnectionPointType.VEC4)
    ]);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.param_name]);
      });
    });
  }
  set_lines(shaders_collection_controller) {
    const uv = ThreeToGl2.vector2(this.variable_for_input(this.p.uv.name));
    const rgba = this.gl_var_name(TextureGlNode2.OUTPUT_NAME);
    const map = this._uniform_name();
    const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, map);
    const body_line = `vec4 ${rgba} = texture2D(${map}, ${uv})`;
    shaders_collection_controller.add_definitions(this, [definition]);
    shaders_collection_controller.add_body_lines(this, [body_line]);
  }
  set_param_configs() {
    this._param_configs_controller = this._param_configs_controller || new ParamConfigsController2();
    this._param_configs_controller.reset();
    const param_config = new GlParamConfig(ParamType2.OPERATOR_PATH, this.pv.param_name, this.pv.default_value, this._uniform_name());
    this._param_configs_controller.push(param_config);
  }
  _uniform_name() {
    return this.gl_var_name(this.pv.param_name);
  }
};
export let TextureGlNode = TextureGlNode2;
TextureGlNode.OUTPUT_NAME = "rgba";
