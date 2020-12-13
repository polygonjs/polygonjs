import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {PixelShader as PixelShader2} from "../../../modules/three/examples/jsm/shaders/PixelShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PixelPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.pixel_size = ParamConfig.INTEGER(16, {
      range: [1, 50],
      range_locked: [true, false],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new PixelPostParamsConfig();
export class PixelPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "pixel";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(PixelShader2);
    pass.uniforms.resolution.value = context.resolution;
    pass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.pixelSize.value = this.pv.pixel_size;
  }
}
