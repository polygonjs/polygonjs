import {BaseSceneEventsController} from "./_BaseEventsController";
var MouseEventType;
(function(MouseEventType2) {
  MouseEventType2["auxclick"] = "auxclick";
  MouseEventType2["click"] = "click";
  MouseEventType2["contextmenu"] = "contextmenu";
  MouseEventType2["dblclick"] = "dblclick";
  MouseEventType2["mousedown"] = "mousedown";
  MouseEventType2["mouseenter"] = "mouseenter";
  MouseEventType2["mouseleave"] = "mouseleave";
  MouseEventType2["mousemove"] = "mousemove";
  MouseEventType2["mouseover"] = "mouseover";
  MouseEventType2["mouseout"] = "mouseout";
  MouseEventType2["mouseup"] = "mouseup";
  MouseEventType2["pointerlockchange"] = "pointerlockchange";
  MouseEventType2["pointerlockerror"] = "pointerlockerror";
  MouseEventType2["select"] = "select";
  MouseEventType2["wheel"] = "wheel";
})(MouseEventType || (MouseEventType = {}));
export const ACCEPTED_MOUSE_EVENT_TYPES = [
  MouseEventType.auxclick,
  MouseEventType.click,
  MouseEventType.contextmenu,
  MouseEventType.dblclick,
  MouseEventType.mousedown,
  MouseEventType.mouseenter,
  MouseEventType.mouseleave,
  MouseEventType.mousemove,
  MouseEventType.mouseover,
  MouseEventType.mouseout,
  MouseEventType.mouseup,
  MouseEventType.pointerlockchange,
  MouseEventType.pointerlockerror,
  MouseEventType.select,
  MouseEventType.wheel
];
export class MouseEventsController extends BaseSceneEventsController {
  constructor() {
    super(...arguments);
    this._require_canvas_event_listeners = true;
  }
  type() {
    return "mouse";
  }
  accepted_event_types() {
    return ACCEPTED_MOUSE_EVENT_TYPES.map((n) => `${n}`);
  }
}
