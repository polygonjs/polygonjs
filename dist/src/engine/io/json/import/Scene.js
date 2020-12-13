import {PolyScene as PolyScene2} from "../../../scene/PolyScene";
import {JsonImportDispatcher} from "./Dispatcher";
import {ImportReport as ImportReport2} from "./ImportReport";
export class SceneJsonImporter {
  constructor(_data) {
    this._data = _data;
    this.report = new ImportReport2(this);
  }
  static async load_data(data) {
    const importer = new SceneJsonImporter(data);
    return await importer.scene();
  }
  async scene() {
    const scene = new PolyScene2();
    scene.loading_controller.mark_as_loading();
    const properties = this._data["properties"];
    if (properties) {
      const frame_range = properties["frame_range"] || [];
      scene.time_controller.set_frame_range(frame_range[0] || 1, frame_range[1] || 100);
      const frame_range_locked = properties["frame_range_locked"];
      if (frame_range_locked) {
        scene.time_controller.set_frame_range_locked(frame_range_locked[0], frame_range_locked[1]);
      }
      const realtime_state = properties["realtime_state"];
      if (realtime_state != null) {
        scene.time_controller.set_realtime_state(realtime_state);
      }
      scene.set_frame(properties["frame"] || 1);
      if (properties["master_camera_node_path"]) {
        scene.cameras_controller.set_master_camera_node_path(properties["master_camera_node_path"]);
      }
    }
    scene.cooker.block();
    this._base_operations_composer_nodes_with_resolve_required = void 0;
    const importer = JsonImportDispatcher.dispatch_node(scene.root);
    if (this._data["root"]) {
      importer.process_data(this, this._data["root"]);
    }
    if (this._data["ui"]) {
      importer.process_ui_data(this, this._data["ui"]);
    }
    this._resolve_operation_containers_with_path_param_resolve();
    await scene.loading_controller.mark_as_loaded();
    scene.cooker.unblock();
    return scene;
  }
  add_operations_composer_node_with_path_param_resolve_required(operations_composer_node) {
    if (!this._base_operations_composer_nodes_with_resolve_required) {
      this._base_operations_composer_nodes_with_resolve_required = [];
    }
    this._base_operations_composer_nodes_with_resolve_required.push(operations_composer_node);
  }
  _resolve_operation_containers_with_path_param_resolve() {
    if (!this._base_operations_composer_nodes_with_resolve_required) {
      return;
    }
    for (let operations_composer_node of this._base_operations_composer_nodes_with_resolve_required) {
      operations_composer_node.resolve_operation_containers_path_params();
    }
  }
}
