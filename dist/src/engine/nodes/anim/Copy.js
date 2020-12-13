import {TypedAnimNode} from "./_Base";
import {CopyStamp as CopyStamp2} from "./utils/CopyStamp";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
class CopyAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.count = ParamConfig.INTEGER(1, {
      range: [1, 20],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new CopyAnimParamsConfig();
export class CopyAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "copy";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
  }
  async cook(input_contents) {
    const builder = new TimelineBuilder2();
    for (let i = 0; i < this.pv.count; i++) {
      this.stamp_node.set_global_index(i);
      const container = await this.container_controller.request_input_container(0);
      if (container) {
        const stamped_builder = container.core_content_cloned();
        if (stamped_builder) {
          builder.add_timeline_builder(stamped_builder);
        }
      }
    }
    this.set_timeline_builder(builder);
  }
  stamp_value(attrib_name) {
    return this.stamp_node.value(attrib_name);
  }
  get stamp_node() {
    return this._stamp_node = this._stamp_node || this.create_stamp_node();
  }
  create_stamp_node() {
    const stamp_node = new CopyStamp2(this.scene);
    this.dirty_controller.set_forbidden_trigger_nodes([stamp_node]);
    return stamp_node;
  }
}
