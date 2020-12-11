export class LifeCycleController {
  constructor(node) {
    this.node = node;
    this._creation_completed = false;
  }
  set_creation_completed() {
    if (!this._creation_completed) {
      this._creation_completed = true;
    }
  }
  get creation_completed() {
    return this.node.scene.loading_controller.loaded && this._creation_completed;
  }
  add_on_child_add_hook(callback) {
    this._on_child_add_hooks = this._on_child_add_hooks || [];
    this._on_child_add_hooks.push(callback);
  }
  run_on_child_add_hooks(node) {
    this.execute_hooks_with_child_node(this._on_child_add_hooks, node);
  }
  add_on_child_remove_hook(callback) {
    this._on_child_remove_hooks = this._on_child_remove_hooks || [];
    this._on_child_remove_hooks.push(callback);
  }
  run_on_child_remove_hooks(node) {
    this.execute_hooks_with_child_node(this._on_child_remove_hooks, node);
  }
  add_on_create_hook(callback) {
    this._on_create_hooks = this._on_create_hooks || [];
    this._on_create_hooks.push(callback);
  }
  run_on_create_hooks() {
    this.execute_hooks(this._on_create_hooks);
  }
  add_on_add_hook(callback) {
    this._on_add_hooks = this._on_add_hooks || [];
    this._on_add_hooks.push(callback);
  }
  run_on_add_hooks() {
    this.execute_hooks(this._on_add_hooks);
  }
  add_delete_hook(callback) {
    this._on_delete_hooks = this._on_delete_hooks || [];
    this._on_delete_hooks.push(callback);
  }
  run_on_delete_hooks() {
    this.execute_hooks(this._on_delete_hooks);
  }
  execute_hooks(hooks) {
    if (hooks) {
      let hook;
      for (hook of hooks) {
        hook();
      }
    }
  }
  execute_hooks_with_child_node(hooks, child_node) {
    if (hooks) {
      let hook;
      for (hook of hooks) {
        hook(child_node);
      }
    }
  }
}
