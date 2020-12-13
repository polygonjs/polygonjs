import {TypedGlNode} from "./_Base";
import {GlConnectionPointType, GlConnectionPoint} from "../utils/io/connections/Gl";
import {ThreeToGl as ThreeToGl2} from "../../../core/ThreeToGl";
export var ColorCorrectType;
(function(ColorCorrectType2) {
  ColorCorrectType2["LINEAR"] = "Linear";
  ColorCorrectType2["GAMMA"] = "Gamma";
  ColorCorrectType2["SRGB"] = "sRGB";
  ColorCorrectType2["RGBE"] = "RGBE";
  ColorCorrectType2["RGBM"] = "RGBM";
  ColorCorrectType2["RGBD"] = "RGBD";
  ColorCorrectType2["LogLuv"] = "LogLuv";
})(ColorCorrectType || (ColorCorrectType = {}));
const TYPES = [
  ColorCorrectType.LINEAR,
  ColorCorrectType.GAMMA,
  ColorCorrectType.SRGB,
  ColorCorrectType.RGBE,
  ColorCorrectType.RGBM,
  ColorCorrectType.RGBD,
  ColorCorrectType.LogLuv
];
import {ParamConfig, NodeParamsConfig} from "../utils/params/ParamsConfig";
class ColorCorrectParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.color = ParamConfig.VECTOR4([1, 1, 1, 1]);
    this.from = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.LINEAR), {
      menu: {
        entries: TYPES.map((type, i) => {
          return {name: type, value: i};
        })
      }
    });
    this.to = ParamConfig.INTEGER(TYPES.indexOf(ColorCorrectType.GAMMA), {
      menu: {
        entries: TYPES.map((type, i) => {
          return {name: type, value: i};
        })
      }
    });
    this.gamma_factor = ParamConfig.FLOAT(2.2);
  }
}
const ParamsConfig2 = new ColorCorrectParamsConfig();
const ColorCorrectGlNode2 = class extends TypedGlNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "color_correct";
  }
  initialize_node() {
    this.io.connection_points.spare_params.set_inputless_param_names(["to", "from"]);
    this.io.outputs.set_named_output_connection_points([
      new GlConnectionPoint(ColorCorrectGlNode2.OUTPUT_NAME, GlConnectionPointType.VEC4)
    ]);
  }
  set_lines(shaders_collection_controller) {
    const from = TYPES[this.pv.from];
    const to = TYPES[this.pv.to];
    const out = this.gl_var_name(ColorCorrectGlNode2.OUTPUT_NAME);
    const arg_in = ThreeToGl2.any(this.variable_for_input(ColorCorrectGlNode2.INPUT_NAME));
    const body_lines = [];
    if (from != to) {
      const method_name = `${from}To${to}`;
      const args = [];
      args.push(arg_in);
      if (from == ColorCorrectType.GAMMA || to == ColorCorrectType.GAMMA) {
        const arg_gamma_factor = ThreeToGl2.any(this.variable_for_input(ColorCorrectGlNode2.INPUT_GAMMA_FACTOR));
        args.push(arg_gamma_factor);
      }
      body_lines.push(`vec4 ${out} = ${method_name}(${args.join(", ")})`);
    } else {
      body_lines.push(`vec4 ${out} = ${arg_in}`);
    }
    shaders_collection_controller.add_body_lines(this, body_lines);
  }
};
export let ColorCorrectGlNode = ColorCorrectGlNode2;
ColorCorrectGlNode.INPUT_NAME = "color";
ColorCorrectGlNode.INPUT_GAMMA_FACTOR = "gamma_factor";
ColorCorrectGlNode.OUTPUT_NAME = "out";
