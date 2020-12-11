import {BaseFlag} from "./Base";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
export class BypassFlag extends BaseFlag {
  constructor() {
    super(...arguments);
    this._state = false;
  }
  on_update() {
    this.node.emit(NodeEvent2.FLAG_BYPASS_UPDATED);
    this.node.set_dirty();
  }
}
