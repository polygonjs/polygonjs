import {TypedAnimNode} from "./_Base";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import {TypeAssert} from "../../poly/Assert";
import {AnimationPosition, AnimationPositionMode, AnimationPositionRelativeTo} from "../../../core/animation/Position";
var MergeMode;
(function(MergeMode2) {
  MergeMode2["ALL_TOGETHER"] = "play all together";
  MergeMode2["ONE_AT_A_TIME"] = "play one at a time";
})(MergeMode || (MergeMode = {}));
const MERGE_MODES = [MergeMode.ALL_TOGETHER, MergeMode.ONE_AT_A_TIME];
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class MergeAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(0, {
      menu: {
        entries: MERGE_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.offset = ParamConfig.FLOAT(0, {
      range: [-1, 1]
    });
    this.override_positions = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new MergeAnimParamsConfig();
export class MergeAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "merge";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 4);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.mode], () => {
          const mode = MERGE_MODES[this.pv.mode];
          return mode;
        });
      });
    });
  }
  cook(input_contents) {
    const merged_timeline_builder = new TimelineBuilder2();
    let i = 0;
    for (let timeline_builder of input_contents) {
      if (timeline_builder) {
        if (i > 0) {
          this._update_timeline_builder(timeline_builder);
        }
        merged_timeline_builder.add_timeline_builder(timeline_builder);
        i++;
      }
    }
    this.set_timeline_builder(merged_timeline_builder);
  }
  _update_timeline_builder(timeline_builder) {
    const mode = MERGE_MODES[this.pv.mode];
    switch (mode) {
      case MergeMode.ALL_TOGETHER:
        return this._set_play_all_together(timeline_builder);
      case MergeMode.ONE_AT_A_TIME:
        return this._set_play_one_at_a_time(timeline_builder);
    }
    TypeAssert.unreachable(mode);
  }
  _set_play_all_together(timeline_builder) {
    let position = timeline_builder.position();
    if (!position || this.pv.override_positions) {
      position = new AnimationPosition();
      position.set_mode(AnimationPositionMode.RELATIVE);
      position.set_relative_to(AnimationPositionRelativeTo.START);
      position.set_offset(this.pv.offset);
      timeline_builder.set_position(position);
    }
  }
  _set_play_one_at_a_time(timeline_builder) {
    let position = timeline_builder.position();
    if (!position || this.pv.override_positions) {
      position = new AnimationPosition();
      position.set_mode(AnimationPositionMode.RELATIVE);
      position.set_relative_to(AnimationPositionRelativeTo.END);
      position.set_offset(this.pv.offset);
      timeline_builder.set_position(position);
    }
  }
}
