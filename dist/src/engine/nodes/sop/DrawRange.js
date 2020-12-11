import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class DrawRangeSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.start = ParamConfig.INTEGER(0, {
      range: [0, 100],
      range_locked: [true, false]
    });
    this.use_count = ParamConfig.BOOLEAN(0);
    this.count = ParamConfig.INTEGER(0, {
      range: [0, 100],
      range_locked: [true, false],
      visible_if: {use_count: 1}
    });
  }
}
const ParamsConfig2 = new DrawRangeSopParamsConfig();
export class DrawRangeSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "draw_range";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  cook(input_contents) {
    const core_group = input_contents[0];
    const objects = core_group.objects();
    for (let object of objects) {
      const geometry = object.geometry;
      if (geometry) {
        const draw_range = geometry.drawRange;
        draw_range.start = this.pv.start;
        if (this.pv.use_count) {
          draw_range.count = this.pv.count;
        } else {
          draw_range.count = Infinity;
        }
      }
    }
    this.set_core_group(core_group);
  }
}
