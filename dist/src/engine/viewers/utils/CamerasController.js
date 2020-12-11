import {Vector2 as Vector22} from "three/src/math/Vector2";
export class ViewerCamerasController {
  constructor(_viewer) {
    this._viewer = _viewer;
    this._size = new Vector22(100, 100);
    this._aspect = 1;
  }
  get camera_node() {
    return this._viewer.camera_node;
  }
  get size() {
    return this._size;
  }
  get aspect() {
    return this._aspect;
  }
  compute_size_and_aspect() {
    this._update_size();
    this.camera_node.scene.uniforms_controller.update_resolution_dependent_uniform_owners(this._size);
    this._aspect = this._get_aspect();
  }
  _update_size() {
    this._size.x = this._viewer.container.offsetWidth;
    this._size.y = this._viewer.container.offsetHeight;
  }
  _get_aspect() {
    return this._size.x / this._size.y;
  }
  update_camera_aspect() {
    this.camera_node.setup_for_aspect_ratio(this._aspect);
  }
  async prepare_current_camera() {
    await this.camera_node.request_container();
    await this._update_from_camera_container();
  }
  async _update_from_camera_container() {
    this.update_camera_aspect();
    await this._viewer.controls_controller?.create_controls();
  }
}
