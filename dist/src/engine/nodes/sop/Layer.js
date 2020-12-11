import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class LayerSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.layer = ParamConfig.INTEGER(0, {
      range: [0, 31],
      range_locked: [true, true]
    });
  }
}
const ParamsConfig2 = new LayerSopParamsConfig();
export class LayerSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "layer";
  }
  static displayed_input_names() {
    return ["objects to change layers of"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.layer]);
      });
    });
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    for (let object of core_group.objects()) {
      object.layers.set(this.pv.layer);
    }
    this.set_core_group(core_group);
  }
}
