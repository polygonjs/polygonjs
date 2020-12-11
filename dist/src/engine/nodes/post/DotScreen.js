import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {DotScreenShader as DotScreenShader2} from "../../../modules/three/examples/jsm/shaders/DotScreenShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class DotScreenPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.center = ParamConfig.VECTOR2([0.5, 0.5], {
      ...PostParamOptions
    });
    this.angle = ParamConfig.FLOAT("$PI*0.5", {
      range: [0, 10],
      range_locked: [false, false],
      ...PostParamOptions
    });
    this.scale = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [false, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new DotScreenPostParamsConfig();
export class DotScreenPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "dot_screen";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(DotScreenShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.center.value = this.pv.center;
    pass.uniforms.angle.value = this.pv.angle;
    pass.uniforms.scale.value = this.pv.scale;
  }
}
