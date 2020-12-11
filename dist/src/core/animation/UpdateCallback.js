export class AnimationUpdateCallback {
  constructor() {
    this._update_matrix = false;
  }
  clone() {
    const new_update_callback = new AnimationUpdateCallback();
    new_update_callback.set_update_matrix(this._update_matrix);
    return new_update_callback;
  }
  set_update_matrix(update_matrix) {
    this._update_matrix = update_matrix;
  }
  update_matrix() {
    return this._update_matrix;
  }
}
