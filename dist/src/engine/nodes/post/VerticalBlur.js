import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {VerticalBlurShader as VerticalBlurShader2} from "../../../modules/three/examples/jsm/shaders/VerticalBlurShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class VerticalBlurPostParamsConfig extends NodeParamsConfig {
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
const ParamsConfig2 = new VerticalBlurPostParamsConfig();
export class VerticalBlurPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "vertical_blur";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(VerticalBlurShader2);
    pass.resolution_y = context.resolution.y;
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.v.value = this.pv.amount / (pass.resolution_y * window.devicePixelRatio);
    pass.material.transparent = this.pv.transparent;
  }
}
