import {TypedSopNode} from "./_Base";
import {AnimationMixer as AnimationMixer2} from "three/src/animation/AnimationMixer";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AnimationMixerSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.time = ParamConfig.FLOAT("$T", {range: [0, 10]});
    this.clip = ParamConfig.OPERATOR_PATH("/ANIM/OUT", {
      node_selection: {
        context: NodeContext2.ANIM
      },
      dependent_on_found_node: false
    });
    this.reset = ParamConfig.BUTTON(null, {
      callback: (node, param) => {
        AnimationMixerSopNode.PARAM_CALLBACK_reset(node, param);
      }
    });
  }
}
const ParamsConfig2 = new AnimationMixerSopParamsConfig();
export class AnimationMixerSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "animation_mixer";
  }
  static displayed_input_names() {
    return ["geometry to be animated"];
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.NEVER);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const object = core_group.objects()[0];
    if (object) {
      await this.create_mixer_if_required(object);
      this._update_mixer();
    }
    this.set_objects([object]);
  }
  async create_mixer_if_required(object) {
    if (!this._mixer) {
      const mixer = await this._create_mixer(object);
      if (mixer) {
        this._mixer = mixer;
      }
    }
  }
  async _create_mixer(object) {
    if (this.p.clip.is_dirty) {
      await this.p.clip.compute();
    }
    const anim_node = this.p.clip.found_node_with_context(NodeContext2.ANIM);
    if (anim_node) {
      const mixer = new AnimationMixer2(object);
      return mixer;
    }
  }
  _update_mixer() {
    this._set_mixer_time();
  }
  _set_mixer_time() {
    if (this.pv.time != this._previous_time) {
      if (this._mixer) {
        this._mixer.setTime(this.pv.time);
      }
      this._previous_time = this.pv.time;
    }
  }
  static PARAM_CALLBACK_reset(node, param) {
    param.set_dirty();
    node.reset_animation_mixer();
  }
  async reset_animation_mixer() {
    this._mixer = void 0;
    this._previous_time = void 0;
    this.set_dirty();
  }
}
