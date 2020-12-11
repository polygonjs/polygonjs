export class ViewersRegister {
  constructor(scene) {
    this.scene = scene;
    this._viewers_by_id = new Map();
  }
  register_viewer(viewer) {
    this._viewers_by_id.set(viewer.id, viewer);
  }
  unregister_viewer(viewer) {
    this._viewers_by_id.delete(viewer.id);
  }
  traverse_viewers(callback) {
    this._viewers_by_id.forEach(callback);
  }
}
