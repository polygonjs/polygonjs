import {BaseFlag} from "./Base";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
export class DisplayFlag extends BaseFlag {
  on_update() {
    this.node.emit(NodeEvent2.FLAG_DISPLAY_UPDATED);
  }
}
