import {TypedAnimNode} from "./_Base";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import {
  AnimationPosition,
  AnimationPositionMode,
  ANIMATION_POSITION_MODES,
  ANIMATION_POSITION_RELATIVE_TOS
} from "../../../core/animation/Position";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PositionAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.mode = ParamConfig.INTEGER(0, {
      menu: {
        entries: ANIMATION_POSITION_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.relative_to = ParamConfig.INTEGER(0, {
      menu: {
        entries: ANIMATION_POSITION_RELATIVE_TOS.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.offset = ParamConfig.FLOAT(0);
  }
}
const ParamsConfig2 = new PositionAnimParamsConfig();
export class PositionAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "position";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.mode, this.p.relative_to, this.p.offset], () => {
          const mode = ANIMATION_POSITION_MODES[this.pv.mode];
          switch (mode) {
            case AnimationPositionMode.RELATIVE:
              return this._relative_label();
            case AnimationPositionMode.ABSOLUTE:
              return this._absolute_label();
          }
        });
      });
    });
  }
  _relative_label() {
    const after_before = this.pv.offset > 0 ? "after" : "before";
    const relative_to = ANIMATION_POSITION_RELATIVE_TOS[this.pv.relative_to];
    return `${Math.abs(this.pv.offset)} ${after_before} ${relative_to}`;
  }
  _absolute_label() {
    return "absolute";
  }
  cook(input_contents) {
    const timeline_builder = input_contents[0] || new TimelineBuilder2();
    const position = new AnimationPosition();
    position.set_mode(ANIMATION_POSITION_MODES[this.pv.mode]);
    position.set_relative_to(ANIMATION_POSITION_RELATIVE_TOS[this.pv.relative_to]);
    position.set_offset(this.pv.offset);
    timeline_builder.set_position(position);
    this.set_timeline_builder(timeline_builder);
  }
}
