import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {ACCEPTED_POINTER_EVENT_TYPES} from "../../scene/utils/events/PointerEventsController";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {TypedInputEventNode, EVENT_PARAM_OPTIONS} from "./_BaseInput";
class PointerEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.active = ParamConfig.BOOLEAN(true, {
      callback: (node) => {
        PointerEventNode.PARAM_CALLBACK_update_register(node);
      }
    });
    this.sep = ParamConfig.SEPARATOR(null, {visible_if: {active: true}});
    this.pointerdown = ParamConfig.BOOLEAN(1, EVENT_PARAM_OPTIONS);
    this.pointermove = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
    this.pointerup = ParamConfig.BOOLEAN(0, EVENT_PARAM_OPTIONS);
  }
}
const ParamsConfig2 = new PointerEventParamsConfig();
export class PointerEventNode extends TypedInputEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "pointer";
  }
  accepted_event_types() {
    return ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`);
  }
  initialize_node() {
    this.io.outputs.set_named_output_connection_points(ACCEPTED_POINTER_EVENT_TYPES.map((event_type) => {
      return new EventConnectionPoint(event_type, EventConnectionPointType.POINTER);
    }));
  }
}
