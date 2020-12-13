export class CameraControlsConfig {
  constructor(_camera_node_id, _controls_node, _controls) {
    this._camera_node_id = _camera_node_id;
    this._controls_node = _controls_node;
    this._controls = _controls;
    this._update_required = this._controls_node.update_required();
  }
  update_required() {
    return this._update_required;
  }
  get camera_node_id() {
    return this._camera_node_id;
  }
  get controls() {
    return this._controls;
  }
  get controls_node() {
    return this._controls_node;
  }
  is_equal(other_config) {
    return other_config.camera_node_id == this._camera_node_id && other_config.controls_node.graph_node_id == this._controls_node.graph_node_id;
  }
}
