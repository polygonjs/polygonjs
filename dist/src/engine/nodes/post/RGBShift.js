import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {RGBShiftShader as RGBShiftShader2} from "../../../modules/three/examples/jsm/shaders/RGBShiftShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class RGBShiftPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(5e-3, {
      range: [0, 1],
      range_locked: [true, false],
      ...PostParamOptions
    });
    this.angle = ParamConfig.FLOAT(0, {
      range: [0, 10],
      range_locked: [true, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new RGBShiftPostParamsConfig();
export class RGBShiftPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "rgb_shift";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(RGBShiftShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.amount.value = this.pv.amount;
    pass.uniforms.angle.value = this.pv.angle;
  }
}
