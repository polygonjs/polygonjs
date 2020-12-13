export class LifeCycleController {
  constructor(scene) {
    this.scene = scene;
    this._lifecycle_on_create_allowed = true;
  }
  on_create_hook_allowed() {
    return this.scene.loading_controller.loaded && this._lifecycle_on_create_allowed;
  }
  on_create_prevent(callback) {
    this._lifecycle_on_create_allowed = false;
    callback();
    this._lifecycle_on_create_allowed = true;
  }
}
