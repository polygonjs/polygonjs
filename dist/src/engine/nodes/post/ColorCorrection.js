import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {ColorCorrectionShader as ColorCorrectionShader2} from "../../../modules/three/examples/jsm/shaders/ColorCorrectionShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ColorCorrectionPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.pow = ParamConfig.VECTOR3([2, 2, 2], {
      ...PostParamOptions
    });
    this.mult = ParamConfig.COLOR([1, 1, 1], {
      ...PostParamOptions
    });
    this.add = ParamConfig.COLOR([0, 0, 0], {
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new ColorCorrectionPostParamsConfig();
export class ColorCorrectionPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "color_correction";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(ColorCorrectionShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.powRGB.value.copy(this.pv.pow);
    pass.uniforms.mulRGB.value.set(this.pv.mult.r, this.pv.mult.g, this.pv.mult.b);
    pass.uniforms.addRGB.value.set(this.pv.add.r, this.pv.add.g, this.pv.add.b);
  }
}
