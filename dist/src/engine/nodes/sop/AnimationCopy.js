import {TypedSopNode} from "./_Base";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
class AnimationCopySopParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new AnimationCopySopParamsConfig();
export class AnimationCopySopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "animation_copy";
  }
  static displayed_input_names() {
    return ["geometry to copy animation to", "geometry to copy animation from"];
  }
  initialize_node() {
    this.io.inputs.set_count(2);
    this.io.inputs.init_inputs_cloned_state([InputCloneMode2.FROM_NODE, InputCloneMode2.NEVER]);
  }
  cook(input_contents) {
    const core_group_target = input_contents[0];
    const core_group_src = input_contents[1];
    const src_object = core_group_src.objects()[0];
    const target_object = core_group_target.objects()[0];
    const src_animations = src_object.animations;
    if (src_animations) {
      target_object.animations = src_animations.map((a) => a.clone());
      this.set_core_group(core_group_target);
    } else {
      this.states.error.set("no animation found");
    }
  }
}
