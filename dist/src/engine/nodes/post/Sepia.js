import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {SepiaShader as SepiaShader2} from "../../../modules/three/examples/jsm/shaders/SepiaShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class SepiaPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(0.5, {
      range: [0, 2],
      range_locked: [false, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new SepiaPostParamsConfig();
export class SepiaPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "sepia";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(SepiaShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.amount.value = this.pv.amount;
  }
}
