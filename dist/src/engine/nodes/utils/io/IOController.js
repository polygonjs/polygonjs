import {InputsController as InputsController2} from "./InputsController";
import {OutputsController as OutputsController2} from "./OutputsController";
import {ConnectionsController as ConnectionsController2} from "./ConnectionsController";
import {SavedConnectionPointsDataController as SavedConnectionPointsDataController2} from "./SavedConnectionPointsDataController";
import {ConnectionPointsController as ConnectionPointsController2} from "./ConnectionPointsController";
export class IOController {
  constructor(node) {
    this.node = node;
    this._connections = new ConnectionsController2(this.node);
  }
  get connections() {
    return this._connections;
  }
  get inputs() {
    return this._inputs = this._inputs || new InputsController2(this.node);
  }
  has_inputs() {
    return this._inputs != null;
  }
  get outputs() {
    return this._outputs = this._outputs || new OutputsController2(this.node);
  }
  has_outputs() {
    return this._outputs != null;
  }
  get connection_points() {
    return this._connection_points = this._connection_points || new ConnectionPointsController2(this.node, this.node.node_context());
  }
  get has_connection_points_controller() {
    return this._connection_points != null;
  }
  get saved_connection_points_data() {
    return this._saved_connection_points_data = this._saved_connection_points_data || new SavedConnectionPointsDataController2(this.node);
  }
  clear_saved_connection_points_data() {
    if (this._saved_connection_points_data) {
      this._saved_connection_points_data.clear();
      this._saved_connection_points_data = void 0;
    }
  }
}
