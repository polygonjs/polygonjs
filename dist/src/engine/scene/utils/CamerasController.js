export class CamerasController {
  constructor(scene) {
    this.scene = scene;
    this._master_camera_node_path = null;
  }
  set_master_camera_node_path(camera_node_path) {
    this._master_camera_node_path = camera_node_path;
  }
  get master_camera_node_path() {
    return this._master_camera_node_path;
  }
  get master_camera_node() {
    if (this.master_camera_node_path) {
      const camera_node = this.scene.node(this.master_camera_node_path);
      return camera_node;
    } else {
      console.warn("master camera node not found");
      return this._find_any_camera();
    }
  }
  _find_any_camera() {
    const root = this.scene.root;
    return root.nodes_by_type("perspective_camera")[0] || root.nodes_by_type("orthographic_camera")[0];
  }
}
