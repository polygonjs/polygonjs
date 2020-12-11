import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {HorizontalBlurShader as HorizontalBlurShader2} from "../../../modules/three/examples/jsm/shaders/HorizontalBlurShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class HorizontalBlurPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.amount = ParamConfig.FLOAT(2, {
      range: [0, 10],
      range_locked: [true, false],
      step: 0.01,
      ...PostParamOptions
    });
    this.transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
  }
}
const ParamsConfig2 = new HorizontalBlurPostParamsConfig();
export class HorizontalBlurPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "horizontal_blur";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(HorizontalBlurShader2);
    pass.resolution_x = context.resolution.x;
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.h.value = this.pv.amount / (pass.resolution_x * window.devicePixelRatio);
    pass.material.transparent = this.pv.transparent;
  }
}
