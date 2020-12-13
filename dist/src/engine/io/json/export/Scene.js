import {CoreString} from "../../../../core/String";
import {JsonExportDispatcher} from "./Dispatcher";
export class SceneJsonExporter {
  constructor(_scene) {
    this._scene = _scene;
    this._data = {};
  }
  data() {
    this._scene.nodes_controller.reset_node_context_signatures();
    const root_exporter = JsonExportDispatcher.dispatch_node(this._scene.root);
    const nodes_data = root_exporter.data();
    const ui_data = root_exporter.ui_data();
    this._data = {
      properties: {
        frame: this._scene.frame || 1,
        frame_range: this._scene.frame_range,
        frame_range_locked: this._scene.time_controller.frame_range_locked,
        realtime_state: this._scene.time_controller.realtime_state,
        master_camera_node_path: this._scene.cameras_controller.master_camera_node_path
      },
      root: nodes_data,
      ui: ui_data
    };
    return this._data;
  }
  static sanitize_string(word) {
    word = word.replace(/'/g, "'");
    word = CoreString.escape_line_breaks(word);
    return word;
  }
}
