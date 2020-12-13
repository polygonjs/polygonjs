var EVENT;
(function(EVENT2) {
  EVENT2["CHANGE"] = "change";
  EVENT2["MOVEEND"] = "moveend";
})(EVENT || (EVENT = {}));
export class CameraController {
  constructor(_callback) {
    this._callback = _callback;
    this._update_always = true;
    this._listener_added = false;
    this._listener = this._execute_callback.bind(this);
  }
  remove_target() {
    this.set_target(void 0);
  }
  set_target(target) {
    if (!target) {
      this._remove_camera_event();
    }
    const old_target = this._target;
    this._target = target;
    if (this._target != null) {
      this._execute_callback();
    }
    if ((this._target != null ? this._target.uuid : void 0) !== (old_target != null ? old_target.uuid : void 0)) {
      this._add_camera_event();
    }
  }
  set_update_always(new_update_always) {
    this._remove_camera_event();
    this._update_always = new_update_always;
    this._add_camera_event();
  }
  _current_event_name() {
    if (this._update_always) {
      return EVENT.CHANGE;
    } else {
      return EVENT.MOVEEND;
    }
  }
  _add_camera_event() {
    if (this._listener_added) {
      return;
    }
    if (this._target != null) {
      this._target.addEventListener(this._current_event_name(), this._listener);
      this._listener_added = true;
    }
  }
  _remove_camera_event() {
    if (this._listener_added !== true) {
      return;
    }
    if (this._target != null) {
      this._target.removeEventListener(this._current_event_name(), this._listener);
      this._listener_added = false;
    }
  }
  _execute_callback() {
    if (this._target != null) {
      this._callback(this._target);
    }
  }
}
