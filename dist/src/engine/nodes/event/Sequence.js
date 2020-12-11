import {TypedEventNode} from "./_Base";
import {EventConnectionPointType} from "../utils/io/connections/Event";
const INPUT_NAME = "trigger";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class PassEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.outputs_count = ParamConfig.INTEGER(5, {
      range: [1, 10],
      range_locked: [true, false]
    });
  }
}
const ParamsConfig2 = new PassEventParamsConfig();
export class SequenceEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "sequence";
  }
  initialize_node() {
    this.io.connection_points.set_input_name_function(() => INPUT_NAME);
    this.io.connection_points.set_expected_input_types_function(() => [EventConnectionPointType.BASE]);
    this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
    this.io.connection_points.set_output_name_function(this._output_name.bind(this));
  }
  _expected_output_types() {
    const list = new Array(this.pv.outputs_count);
    list.fill(EventConnectionPointType.BASE);
    return list;
  }
  _output_name(index) {
    return `out${index}`;
  }
  process_event(event_context) {
    const count = this.pv.outputs_count;
    for (let i = 0; i < count; i++) {
      const connection_point = this.io.outputs.named_output_connection_points[i];
      this.dispatch_event_to_output(connection_point.name, event_context);
    }
  }
}
