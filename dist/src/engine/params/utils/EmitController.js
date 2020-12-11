export class EmitController {
  constructor(param) {
    this.param = param;
    this._blocked_emit = false;
    this._blocked_parent_emit = false;
    this._count_by_event_name = {};
  }
  get emit_allowed() {
    if (this._blocked_emit === true) {
      return false;
    }
    if (this.param.scene.loading_controller.is_loading) {
      return false;
    }
    return this.param.scene.dispatch_controller.emit_allowed;
  }
  block_emit() {
    this._blocked_emit = true;
    if (this.param.is_multiple && this.param.components) {
      this.param.components.forEach((c) => c.emit_controller.block_emit());
    }
    return true;
  }
  unblock_emit() {
    this._blocked_emit = false;
    if (this.param.is_multiple && this.param.components) {
      this.param.components.forEach((c) => c.emit_controller.unblock_emit());
    }
    return true;
  }
  block_parent_emit() {
    this._blocked_parent_emit = true;
    return true;
  }
  unblock_parent_emit() {
    this._blocked_parent_emit = false;
    return true;
  }
  increment_count(event_name) {
    this._count_by_event_name[event_name] = this._count_by_event_name[event_name] || 0;
    this._count_by_event_name[event_name] += 1;
  }
  events_count(event_name) {
    return this._count_by_event_name[event_name] || 0;
  }
  emit(event) {
    if (this.emit_allowed) {
      this.param.emit(event);
      if (this.param.parent_param != null && this._blocked_parent_emit !== true) {
        this.param.parent_param.emit(event);
      }
    }
  }
}
