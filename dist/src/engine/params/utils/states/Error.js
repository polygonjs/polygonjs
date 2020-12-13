import {ParamEvent as ParamEvent2} from "../../../poly/ParamEvent";
export class ErrorState {
  constructor(param) {
    this.param = param;
  }
  set(message) {
    if (this._message != message) {
      this._message = message;
      if (this._message) {
        console.warn(this.param.full_path(), this._message);
      }
      this.param.emit_controller.emit(ParamEvent2.ERROR_UPDATED);
    }
  }
  get message() {
    return this._message;
  }
  clear() {
    this.set(void 0);
  }
  get active() {
    return this._message != null;
  }
}
