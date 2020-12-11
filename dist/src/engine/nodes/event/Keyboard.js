import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from "./_BaseInput";
import {ACCEPTED_KEYBOARD_EVENT_TYPES} from "../../scene/utils/events/KeyboardEventsController";
class KeyboardEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.active = ParamConfig.BOOLEAN(true, {
      callback: (node, param) => {
        KeyboardEventNode.PARAM_CALLBACK_update_register(node);
      }
    });
    this.sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
    this.keydown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.keypress = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.keyup = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
  }
}
const ParamsConfig2 = new KeyboardEventParamsConfig();
export class KeyboardEventNode extends TypedInputEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "keyboard";
  }
  accepted_event_types() {
    return ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`);
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points(ACCEPTED_KEYBOARD_EVENT_TYPES.map((event_type) => {
      return new EventConnectionPoint(event_type, EventConnectionPointType.KEYBOARD);
    }));
  }
}
