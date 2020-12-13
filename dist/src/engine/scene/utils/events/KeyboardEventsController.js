import {BaseSceneEventsController} from "./_BaseEventsController";
var KeyboardEventType;
(function(KeyboardEventType2) {
  KeyboardEventType2["keydown"] = "keydown";
  KeyboardEventType2["keypress"] = "keypress";
  KeyboardEventType2["keyup"] = "keyup";
})(KeyboardEventType || (KeyboardEventType = {}));
export const ACCEPTED_KEYBOARD_EVENT_TYPES = [
  KeyboardEventType.keydown,
  KeyboardEventType.keypress,
  KeyboardEventType.keyup
];
export class KeyboardEventsController extends BaseSceneEventsController {
  constructor() {
    super(...arguments);
    this._require_canvas_event_listeners = true;
  }
  type() {
    return "keyboard";
  }
  accepted_event_types() {
    return ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`);
  }
}
