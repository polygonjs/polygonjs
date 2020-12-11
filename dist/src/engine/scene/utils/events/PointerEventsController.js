import {BaseSceneEventsController} from "./_BaseEventsController";
var PointerEventType;
(function(PointerEventType2) {
  PointerEventType2["pointerdown"] = "pointerdown";
  PointerEventType2["pointermove"] = "pointermove";
  PointerEventType2["pointerup"] = "pointerup";
})(PointerEventType || (PointerEventType = {}));
export const ACCEPTED_POINTER_EVENT_TYPES = [
  PointerEventType.pointerdown,
  PointerEventType.pointermove,
  PointerEventType.pointerup
];
export class PointerEventsController extends BaseSceneEventsController {
  constructor() {
    super(...arguments);
    this._require_canvas_event_listeners = true;
  }
  type() {
    return "pointer";
  }
  accepted_event_types() {
    return ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`);
  }
}
