import {TypedEventNode} from "./_Base";
import {EventConnectionPointType} from "../utils/io/connections/Event";
const OUTPUT_NAME = "event";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class AnyEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.active = ParamConfig.BOOLEAN(1);
    this.inputs_count = ParamConfig.INTEGER(5, {
      range: [1, 10],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new AnyEventParamsConfig();
export class AnyEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "any";
  }
  initialize_node() {
    this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
    this.io.connection_points.set_input_name_function(this._input_name.bind(this));
    this.io.connection_points.set_output_name_function(() => OUTPUT_NAME);
    this.io.connection_points.set_expected_output_types_function(() => [EventConnectionPointType.BASE]);
  }
  _expected_input_types() {
    const list = new Array(this.pv.inputs_count);
    list.fill(EventConnectionPointType.BASE);
    return list;
  }
  _input_name(index) {
    return `trigger${index}`;
  }
  async process_event(event_context) {
    if (this.p.active.is_dirty) {
      await this.p.active.compute();
    }
    if (this.pv.active) {
      this.dispatch_event_to_output(OUTPUT_NAME, event_context);
    }
  }
}
