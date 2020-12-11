import {TypedAnimNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class SwitchAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.input = ParamConfig.INTEGER(0, {
      range: [0, 3],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new SwitchAnimParamsConfig();
export class SwitchAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "switch";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 4);
  }
  cook(input_contents) {
    const timeline_builder = input_contents[this.pv.input];
    if (timeline_builder) {
      this.set_timeline_builder(timeline_builder);
    } else {
      this.states.error.set(`input ${this.pv.input} is not valid`);
    }
  }
}
