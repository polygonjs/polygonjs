export class SavedConnectionPointsDataController {
  constructor(_node) {
    this._node = _node;
  }
  set_in(data) {
    this._in = data;
  }
  set_out(data) {
    this._out = data;
  }
  clear() {
    this._in = void 0;
    this._out = void 0;
  }
  in() {
    return this._in;
  }
  out() {
    return this._out;
  }
}
