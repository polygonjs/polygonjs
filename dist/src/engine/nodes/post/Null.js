import {TypedPostProcessNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class NullPostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new NullPostParamsConfig();
export class NullPostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "null";
  }
}
