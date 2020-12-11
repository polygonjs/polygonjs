import {TypedAnimNode} from "./_Base";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import {AnimNodeEasing, EASINGS, InOutMode, IN_OUT_MODES} from "../../../core/animation/Constant";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class EasingAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.INTEGER(EASINGS.indexOf(AnimNodeEasing.POWER4), {
      menu: {
        entries: EASINGS.map((name, value) => {
          return {name, value};
        })
      }
    });
    this.in_out = ParamConfig.INTEGER(IN_OUT_MODES.indexOf(InOutMode.OUT), {
      menu: {
        entries: IN_OUT_MODES.map((name, value) => {
          return {name, value};
        })
      }
    });
  }
}
const ParamsConfig2 = new EasingAnimParamsConfig();
export class EasingAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "easing";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name, this.p.in_out], () => {
          return this.easing_full_name();
        });
      });
    });
  }
  easing_full_name() {
    const easing = EASINGS[this.pv.name];
    if (easing == AnimNodeEasing.NONE) {
      return easing;
    }
    const in_out = IN_OUT_MODES[this.pv.in_out];
    const easing_full_name = `${easing}.${in_out}`;
    return easing_full_name;
  }
  cook(input_contents) {
    const timeline_builder = input_contents[0] || new TimelineBuilder2();
    const easing_full_name = this.easing_full_name();
    timeline_builder.set_easing(easing_full_name);
    this.set_timeline_builder(timeline_builder);
  }
}
