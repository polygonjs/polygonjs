import {TypedAnimNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import gsap2 from "gsap";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class NullAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.play = ParamConfig.BUTTON(null, {
      callback: (node) => {
        NullAnimNode.PARAM_CALLBACK_play(node);
      }
    });
    this.pause = ParamConfig.BUTTON(null, {
      callback: (node) => {
        NullAnimNode.PARAM_CALLBACK_pause(node);
      }
    });
  }
}
const ParamsConfig2 = new NullAnimParamsConfig();
export class NullAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "null";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    const timeline_builder = input_contents[0] || new TimelineBuilder2();
    this.set_timeline_builder(timeline_builder);
  }
  async play() {
    return new Promise(async (resolve) => {
      const container = await this.request_container();
      if (!container) {
        return;
      }
      this._timeline_builder = container.core_content();
      if (!this._timeline_builder) {
        return;
      }
      if (this._timeline) {
        this._timeline.kill();
      }
      this._timeline = gsap2.timeline({onComplete: resolve});
      this._timeline_builder.populate(this._timeline, this.scene);
    });
  }
  async pause() {
    if (this._timeline) {
      this._timeline.pause();
    }
  }
  static PARAM_CALLBACK_play(node) {
    node.play();
  }
  static PARAM_CALLBACK_pause(node) {
    node.pause();
  }
}
