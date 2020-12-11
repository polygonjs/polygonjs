import {TypedPostProcessNode, PostParamOptions} from "./_Base";
import {AfterimagePass as AfterimagePass2} from "../../../modules/three/examples/jsm/postprocessing/AfterimagePass";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AfterImagePostParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.damp = ParamConfig.FLOAT(0.96, {
      range: [0, 1],
      range_locked: [true, true],
      ...PostParamOptions
    });
  }
}
const ParamsConfig2 = new AfterImagePostParamsConfig();
export class AfterImagePostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "after_image";
  }
  _create_pass(context) {
    const pass = new AfterimagePass2();
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
    pass.uniforms.damp.value = this.pv.damp;
  }
}
