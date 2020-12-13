import {TypedCopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class SwitchCopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.input = ParamConfig.INTEGER(0, {
      range: [0, 3],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new SwitchCopParamsConfig();
export class SwitchCopNode extends TypedCopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "switch";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 4);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
    this.cook_controller.disallow_inputs_evaluation();
  }
  async cook() {
    const input_index = this.pv.input;
    if (this.io.inputs.has_input(input_index)) {
      const container = await this.container_controller.request_input_container(input_index);
      if (container) {
        this.set_texture(container.texture());
        return;
      }
    } else {
      this.states.error.set(`no input ${input_index}`);
    }
    this.cook_controller.end_cook();
  }
}
