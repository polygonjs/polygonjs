import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {BleachBypassShader as BleachBypassShader2} from "../../../modules/three/examples/jsm/shaders/BleachBypassShader";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class BleachPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.opacity = ParamConfig.FLOAT(0.95, {
      range: [-5, 5],
      range_locked: [true, true],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new BleachPostParamsConfig();
export class BleachPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "bleach";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(BleachBypassShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.opacity.value = this.pv.opacity;
  }
}
