import {TypedPostProcessNode} from "./_Base";
import {GammaCorrectionShader as GammaCorrectionShader2} from "../../../modules/three/examples/jsm/shaders/GammaCorrectionShader";
import {ShaderPass as ShaderPass2} from "../../../modules/three/examples/jsm/postprocessing/ShaderPass";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class GammaCorrectionPostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new GammaCorrectionPostParamsConfig();
export class GammaCorrectionPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "gamma_correction";
  }
  _create_pass(context) {
    const pass = new ShaderPass2(GammaCorrectionShader2);
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
  }
}
