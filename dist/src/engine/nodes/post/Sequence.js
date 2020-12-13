import {TypedPostProcessNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class SequencePostParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new SequencePostParamsConfig();
export class SequencePostNode extends TypedPostProcessNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "sequence";
  }
  initialize_node() {
    super.initialize_node();
    this.io.inputs.set_count(0, 4);
  }
  setup_composer(context) {
    this._add_pass_from_input(0, context);
    this._add_pass_from_input(1, context);
    this._add_pass_from_input(2, context);
    this._add_pass_from_input(3, context);
  }
}
