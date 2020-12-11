import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
var ButtonEventOutput;
(function(ButtonEventOutput2) {
  ButtonEventOutput2["OUT"] = "out";
})(ButtonEventOutput || (ButtonEventOutput = {}));
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class ButtonEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.dispatch = ParamConfig.BUTTON(null, {
      callback: (node) => {
        ButtonEventNode.PARAM_CALLBACK_execute(node);
      }
    });
  }
}
const ParamsConfig2 = new ButtonEventParamsConfig();
export class ButtonEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "button";
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(ButtonEventOutput.OUT, EventConnectionPointType.BASE)
    ]);
  }
  process_event(event_context) {
  }
  process_event_execute(event_context) {
    this.dispatch_event_to_output(ButtonEventOutput.OUT, event_context);
  }
  static PARAM_CALLBACK_execute(node) {
    node.process_event_execute({});
  }
}
