export var EventConnectionPointType;
(function(EventConnectionPointType2) {
  EventConnectionPointType2["BASE"] = "base";
  EventConnectionPointType2["KEYBOARD"] = "keyboard";
  EventConnectionPointType2["MOUSE"] = "mouse";
  EventConnectionPointType2["POINTER"] = "pointer";
})(EventConnectionPointType || (EventConnectionPointType = {}));
import {BaseConnectionPoint} from "./_Base";
import {ParamType as ParamType2} from "../../../../poly/ParamType";
export class EventConnectionPoint extends BaseConnectionPoint {
  constructor(_name, _type, _event_listener) {
    super(_name, _type);
    this._name = _name;
    this._type = _type;
    this._event_listener = _event_listener;
  }
  get type() {
    return this._type;
  }
  get param_type() {
    return ParamType2.FLOAT;
  }
  are_types_matched(src_type, dest_type) {
    if (dest_type == EventConnectionPointType.BASE) {
      return true;
    } else {
      return src_type == dest_type;
    }
  }
  get event_listener() {
    return this._event_listener;
  }
  to_json() {
    return this._json = this._json || this._create_json();
  }
  _create_json() {
    return {
      name: this._name,
      type: this._type
    };
  }
}
