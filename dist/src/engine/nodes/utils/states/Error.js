import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
import {BaseState} from "./Base";
import {Poly as Poly2} from "../../../Poly";
export class ErrorState extends BaseState {
  set(message) {
    if (this._message != message) {
      Poly2.warn("error", message, this.node.full_path());
      this._message = message;
      this.on_update();
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
  on_update() {
    if (this._message != null) {
      this.node.set_container(null, `from error '${this._message}'`);
    }
    this.node.emit(NodeEvent2.ERROR_UPDATED);
  }
}
