import {TypedPostProcessNode} from "./_Base";
import {ClearPass as ClearPass2} from "../../../modules/three/examples/jsm/postprocessing/ClearPass";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class ClearPostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new ClearPostParamsConfig();
export class ClearPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "clear";
  }
  _create_pass(context) {
    const pass = new ClearPass2();
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
  }
}
