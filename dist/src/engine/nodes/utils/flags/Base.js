export class BaseFlag {
  constructor(node) {
    this.node = node;
    this._state = true;
    this._hooks = null;
  }
  add_hook(hook) {
    this._hooks = this._hooks || [];
    this._hooks.push(hook);
  }
  on_update() {
  }
  set(new_state) {
    if (this._state != new_state) {
      this._state = new_state;
      this.on_update();
      this.run_hooks();
    }
  }
  get active() {
    return this._state;
  }
  toggle() {
    this.set(!this._state);
  }
  run_hooks() {
    if (this._hooks) {
      for (let hook of this._hooks) {
        hook();
      }
    }
  }
}
