import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {CopyShader as CopyShader2} from "../../../modules/three/examples/jsm/shaders/CopyShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class CopyPostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.opacity = ParamConfig.FLOAT(1, {
      range: [0, 1],
      range_locked: [true, true],
      ...PostParamOptions
    });
    this.transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
  }
}
const ParamsConfig2 = new CopyPostParamsConfig();
export class CopyPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "copy";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(CopyShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.opacity.value = this.pv.opacity;
    pass.material.transparent = this.pv.transparent;
  }
}
