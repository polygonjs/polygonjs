import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
export class RampPoint {
  constructor(_position = 0, _value = 0) {
    this._position = _position;
    this._value = _value;
  }
  to_json() {
    return {
      position: this._position,
      value: this._value
    };
  }
  get position() {
    return this._position;
  }
  get value() {
    return this._value;
  }
  copy(point) {
    this._position = point.position;
    this._value = point.value;
  }
  clone() {
    const point = new RampPoint();
    point.copy(this);
    return point;
  }
  is_equal(other_point) {
    return this._position == other_point.position && this._value == other_point.value;
  }
  is_equal_json(json) {
    return this._position == json.position && this._value == json.value;
  }
  from_json(json) {
    this._position = json.position;
    this._value = json.value;
  }
  static are_equal_json(json1, json2) {
    return json1.position == json2.position && json1.value == json2.value;
  }
  static from_json(json) {
    return new RampPoint(json.position, json.value);
  }
}
export var RampInterpolation;
(function(RampInterpolation2) {
  RampInterpolation2["LINEAR"] = "linear";
})(RampInterpolation || (RampInterpolation = {}));
export class RampValue {
  constructor(_interpolation = RampInterpolation.LINEAR, _points = []) {
    this._interpolation = _interpolation;
    this._points = _points;
    this._uuid = MathUtils2.generateUUID();
  }
  get uuid() {
    return this._uuid;
  }
  get interpolation() {
    return this._interpolation;
  }
  get points() {
    return this._points;
  }
  static from_json(json) {
    const points = [];
    for (let json_point of json.points) {
      points.push(RampPoint.from_json(json_point));
    }
    return new RampValue(json.interpolation, points);
  }
  to_json() {
    return {
      interpolation: this._interpolation,
      points: this._points.map((p) => p.to_json())
    };
  }
  clone() {
    const ramp = new RampValue();
    ramp.copy(this);
    return ramp;
  }
  copy(ramp) {
    this._interpolation = ramp.interpolation;
    let index = 0;
    for (let point of ramp.points) {
      const current_point = this._points[index];
      if (current_point) {
        current_point.copy(point);
      } else {
        this._points.push(point.clone());
      }
      index += 1;
    }
  }
  is_equal(other_ramp_value) {
    if (this._interpolation != other_ramp_value.interpolation) {
      return false;
    }
    const other_points = other_ramp_value.points;
    if (this._points.length != other_points.length) {
      return false;
    }
    let index = 0;
    for (let point of this._points) {
      const other_point = other_points[index];
      if (!point.is_equal(other_point)) {
        return false;
      }
      index += 1;
    }
    return true;
  }
  is_equal_json(json) {
    if (this._interpolation != json.interpolation) {
      return false;
    }
    if (this._points.length != json.points.length) {
      return false;
    }
    let index = 0;
    for (let point of this._points) {
      const other_point = json.points[index];
      if (!point.is_equal_json(other_point)) {
        return false;
      }
      index += 1;
    }
    return true;
  }
  static are_json_equal(json1, json2) {
    if (json1.interpolation != json2.interpolation) {
      return false;
    }
    if (json1.points.length != json2.points.length) {
      return false;
    }
    let index = 0;
    for (let point1 of json1.points) {
      const point2 = json2.points[index];
      if (!RampPoint.are_equal_json(point1, point2)) {
        return false;
      }
      index += 1;
    }
    return true;
  }
  from_json(json) {
    this._interpolation = json.interpolation;
    let index = 0;
    for (let json_point of json.points) {
      const current_point = this._points[index];
      if (current_point) {
        current_point.from_json(json_point);
      } else {
        this._points.push(RampPoint.from_json(json_point));
      }
      index += 1;
    }
  }
}
