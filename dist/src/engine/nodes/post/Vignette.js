import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {VignetteShader as VignetteShader2} from "../../../modules/three/examples/jsm/shaders/VignetteShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class VignettePostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.offset = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [false, false],
      ...PostParamOptions
    });
    this.darkness = ParamConfig.FLOAT(1, {
      range: [0, 2],
      range_locked: [true, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new VignettePostParamsConfig();
export class VignettePostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "vignette";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(VignetteShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.offset.value = this.pv.offset;
    pass.uniforms.darkness.value = this.pv.darkness;
  }
}
