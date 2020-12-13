export class BaseConnectionPoint {
  constructor(_name, _type, _init_value) {
    this._name = _name;
    this._type = _type;
    this._init_value = _init_value;
  }
  get init_value() {
    return this._init_value;
  }
  get name() {
    return this._name;
  }
  get type() {
    return this._type;
  }
  are_types_matched(src_type, dest_type) {
    return true;
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
