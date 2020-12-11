import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class MessageParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.alert = ParamConfig.BOOLEAN(0);
    this.console = ParamConfig.BOOLEAN(1);
  }
}
const ParamsConfig2 = new MessageParamsConfig();
const MessageEventNode2 = class extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "message";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("trigger", EventConnectionPointType.BASE, this._process_trigger_event.bind(this))
    ]);
    this.io.outputs.set_named_output_connection_points([
      new EventConnectionPoint(MessageEventNode2.OUTPUT, EventConnectionPointType.BASE)
    ]);
  }
  trigger_output(context) {
    this.dispatch_event_to_output(MessageEventNode2.OUTPUT, context);
  }
  _process_trigger_event(context) {
    if (this.pv.alert) {
      alert(context);
    }
    if (this.pv.console) {
      console.log(context);
    }
    this.trigger_output(context);
  }
};
export let MessageEventNode = MessageEventNode2;
MessageEventNode.OUTPUT = "output";
