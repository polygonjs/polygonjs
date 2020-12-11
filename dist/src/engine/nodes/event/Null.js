import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
var NullEventInput;
(function(NullEventInput2) {
  NullEventInput2["TRIGGER"] = "trigger";
})(NullEventInput || (NullEventInput = {}));
var NullEventOutput;
(function(NullEventOutput2) {
  NullEventOutput2["OUT"] = "out";
})(NullEventOutput || (NullEventOutput = {}));
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class NullEventParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new NullEventParamsConfig();
export class NullEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "null";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(NullEventInput.TRIGGER, EventConnectionPointType.BASE, this.process_event_trigger.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(NullEventOutput.OUT, EventConnectionPointType.BASE)
    ]);
  }
  process_event(event_context) {
  }
  process_event_trigger(event_context) {
    this.dispatch_event_to_output(NullEventOutput.OUT, event_context);
  }
}
