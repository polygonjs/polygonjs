import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class DelaySopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.duration = ParamConfig.INTEGER(1e3, {
      range: [0, 1e3],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new DelaySopParamsConfig();
export class DelaySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "delay";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.ALWAYS);
  }
  cook(inputs_contents) {
    const core_group = inputs_contents[0];
    const c = () => {
      this.set_core_group(core_group);
    };
    setTimeout(c, Math.max(this.pv.duration, 0));
  }
}
