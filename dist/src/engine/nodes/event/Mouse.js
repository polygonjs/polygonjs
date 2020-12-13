import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {ACCEPTED_MOUSE_EVENT_TYPES} from "../../scene/utils/events/MouseEventsController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from "./_BaseInput";
class MouseEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.active = ParamConfig.BOOLEAN(true, {
      callback: (node) => {
        MouseEventNode.PARAM_CALLBACK_update_register(node);
      }
    });
    this.sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
    this.auxclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.click = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.contextmenu = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.dblclick = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.mousedown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.mouseenter = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.mouseleave = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.mousemove = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.mouseover = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.mouseout = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.mouseup = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.pointerlockchange = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.pointerlockerror = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.select = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.wheel = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
  }
}
const ParamsConfig2 = new MouseEventParamsConfig();
export class MouseEventNode extends TypedInputEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "mouse";
  }
  accepted_event_types() {
    return ACCEPTED_MOUSE_EVENT_TYPES.map((n) => `${n}`);
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points(ACCEPTED_MOUSE_EVENT_TYPES.map((event_type) => {
      return new EventConnectionPoint(event_type, EventConnectionPointType.MOUSE);
    }));
  }
}
