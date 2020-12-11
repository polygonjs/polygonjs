import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
var LimitEventInput;
(function(LimitEventInput2) {
  LimitEventInput2["TRIGGER"] = "trigger";
  LimitEventInput2["RESET"] = "reset";
})(LimitEventInput || (LimitEventInput = {}));
var LimitEventOutput;
(function(LimitEventOutput2) {
  LimitEventOutput2["OUT"] = "out";
  LimitEventOutput2["LAST"] = "last";
})(LimitEventOutput || (LimitEventOutput = {}));
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class LimitEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.max_count = ParamConfig.INTEGER(5, {
      range: [0, 10],
      range_locked: [true, false]
    });
    this.reset = ParamConfig.BUTTON(null, {
      callback: (node) => {
        LimitEventNode.PARAM_CALLBACK_reset(node);
      }
    });
  }
}
const ParamsConfig2 = new LimitEventParamsConfig();
export class LimitEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._process_count = 0;
    this._last_dispatched = false;
  }
  static type() {
    return "limit";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint(LimitEventInput.TRIGGER, EventConnectionPointType.BASE, this.process_event_trigger.bind(this)),
      new EventConnectionPoint(LimitEventInput.RESET, EventConnectionPointType.BASE, this.process_event_reset.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(LimitEventOutput.OUT, EventConnectionPointType.BASE),
      new EventConnectionPoint(LimitEventOutput.LAST, EventConnectionPointType.BASE)
    ]);
  }
  process_event(event_context) {
  }
  process_event_trigger(event_context) {
    if (this._process_count < this.pv.max_count) {
      this._process_count += 1;
      this.dispatch_event_to_output(LimitEventOutput.OUT, event_context);
    } else {
      if (!this._last_dispatched) {
        this._last_dispatched = true;
        this.dispatch_event_to_output(LimitEventOutput.LAST, event_context);
      }
    }
  }
  process_event_reset(event_context) {
    this._process_count = 0;
    this._last_dispatched = false;
  }
  static PARAM_CALLBACK_reset(node) {
    node.process_event_reset({});
  }
}
