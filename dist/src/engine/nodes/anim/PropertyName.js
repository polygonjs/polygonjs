import {TypedAnimNode} from "./_Base";
import {TimelineBuilder as TimelineBuilder2} from "../../../core/animation/TimelineBuilder";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PropertyNameAnimParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.name = ParamConfig.STRING("position");
  }
}
const ParamsConfig2 = new PropertyNameAnimParamsConfig();
export class PropertyNameAnimNode extends TypedAnimNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "property_name";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 1);
    this.scene.dispatch_controller.on_add_listener(() => {
      this.params.on_params_created("params_label", () => {
        this.params.label.init([this.p.name]);
      });
    });
  }
  cook(input_contents) {
    const timeline_builder = input_contents[0] || new TimelineBuilder2();
    timeline_builder.set_property_name(this.pv.name);
    this.set_timeline_builder(timeline_builder);
  }
}
