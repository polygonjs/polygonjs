import {TypedPostProcessNode} from "./_Base";
import {ClearMaskPass} from "../../../modules/three/examples/jsm/postprocessing/MaskPass";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class ClearMaskPostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new ClearMaskPostParamsConfig();
export class ClearMaskPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "clear_mask";
  }
  _create_pass(context) {
    const pass = new ClearMaskPass();
    this.update_pass(pass);
    return pass;
  }
  update_pass(pass) {
  }
}
