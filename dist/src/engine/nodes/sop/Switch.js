import {TypedSopNode} from "./_Base";
const INPUT_NAME = "geometry to switch to";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class SwitchSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.input = ParamConfig.INTEGER(0, {
      range: [0, 3],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new SwitchSopParamsConfig();
export class SwitchSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "switch";
  }
  static displayed_input_names() {
    return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
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
        const core_group = container.core_content();
        if (core_group) {
          this.set_core_group(core_group);
          return;
        }
      }
    } else {
      this.states.error.set(`no input ${input_index}`);
    }
    this.cook_controller.end_cook();
  }
}
