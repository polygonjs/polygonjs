import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import gsap2 from "gsap";
var AnimationEventInput;
(function(AnimationEventInput2) {
  AnimationEventInput2["START"] = "start";
  AnimationEventInput2["STOP"] = "stop";
  AnimationEventInput2["UPDATE"] = "update";
})(AnimationEventInput || (AnimationEventInput = {}));
var AnimationEventOutput;
(function(AnimationEventOutput2) {
  AnimationEventOutput2["START"] = "start";
  AnimationEventOutput2["COMPLETE"] = "completed";
})(AnimationEventOutput || (AnimationEventOutput = {}));
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AnimationEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.animation = ParamConfig.OPERATOR_PATH("/ANIM/OUT", {
      node_selection: {context: NodeContext2.ANIM},
      dependent_on_found_node: false
    });
    this.play = ParamConfig.BUTTON(null, {
      callback: (node) => {
        AnimationEventNode.PARAM_CALLBACK_play(node);
      }
    });
    this.pause = ParamConfig.BUTTON(null, {
      callback: (node) => {
        AnimationEventNode.PARAM_CALLBACK_pause(node);
      }
    });
  }
}
const ParamsConfig2 = new AnimationEventParamsConfig();
export class AnimationEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "animation";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(AnimationEventInput.START, EventConnectionPointType.BASE, this._play.bind(this)),
      new EventConnectionPoint(AnimationEventInput.STOP, EventConnectionPointType.BASE, this._pause.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(AnimationEventOutput.START, EventConnectionPointType.BASE),
      new EventConnectionPoint(AnimationEventOutput.COMPLETE, EventConnectionPointType.BASE)
    ]);
  }
  process_event(event_context) {
  }
  static PARAM_CALLBACK_play(node) {
    node._play({});
  }
  static PARAM_CALLBACK_pause(node) {
    node._pause();
  }
  async _play(event_context) {
    const param = this.p.animation;
    if (param.is_dirty) {
      await param.compute();
    }
    const node = param.found_node_with_context(NodeContext2.ANIM);
    if (!node) {
      return;
    }
    const container = await node.request_container();
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
    this._timeline = gsap2.timeline();
    this._timeline_builder.populate(this._timeline, this.scene);
    this._timeline.vars.onStart = () => {
      this.trigger_animation_started(event_context);
    };
    this._timeline.vars.onComplete = () => {
      if (this._timeline) {
        this._timeline.kill();
      }
      this.trigger_animation_completed(event_context);
    };
  }
  _pause() {
    if (this._timeline) {
      this._timeline.pause();
    }
  }
  trigger_animation_started(event_context) {
    this.dispatch_event_to_output(AnimationEventOutput.START, event_context);
  }
  trigger_animation_completed(event_context) {
    this.dispatch_event_to_output(AnimationEventOutput.COMPLETE, event_context);
  }
}
