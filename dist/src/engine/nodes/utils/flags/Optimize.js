import {BaseFlag} from "./Base";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
export class OptimizeFlag extends BaseFlag {
  constructor() {
    super(...arguments);
    this._state = false;
  }
  on_update() {
    this.node.emit(NodeEvent2.FLAG_OPTIMIZE_UPDATED);
  }
}
