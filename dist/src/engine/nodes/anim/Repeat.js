import {TypedAnimNode} from "./_Base";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class RepeatAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.unlimited = ParamConfig.BOOLEAN(0);
    this.count = ParamConfig.INTEGER(1, {
      range: [0, 10],
      visible_if: {unlimited: 0}
    });
    this.delay = ParamConfig.FLOAT(0);
    this.yoyo = ParamConfig.BOOLEAN(0);
  }
}
const ParamsConfig2 = new RepeatAnimParamsConfig();
export class RepeatAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "repeat";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.unlimited, this.p.count, this.p.yoyo], () => {
          const count = `${this.p.unlimited ? "unlimited" : this.pv.count}`;
          return `${count} (yoyo: ${this.pv.yoyo})`;
        });
      });
    });
  }
  _repeat_params() {
    return {
      count: this.pv.unlimited ? -1 : this.pv.count,
      delay: this.pv.delay,
      yoyo: this.pv.yoyo
    };
  }
  cook(input_contents) {
    const timeline_builder = input_contents[0] || new TimelineBuilder2();
    timeline_builder.set_repeat_params(this._repeat_params());
    this.set_timeline_builder(timeline_builder);
  }
}
