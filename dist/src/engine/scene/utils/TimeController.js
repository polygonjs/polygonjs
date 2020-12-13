import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
import {SceneEvent as SceneEvent2} from "../../poly/SceneEvent";
import {SceneEventType} from "./events/SceneEventsController";
const FPS = 60;
export class TimeController {
  constructor(scene) {
    this.scene = scene;
    this._frame = 1;
    this._time = 0;
    this._prev_performance_now = 0;
    this._frame_range = [1, 600];
    this._realtime_state = true;
    this._frame_range_locked = [true, true];
    this._playing = false;
    this._graph_node = new CoreGraphNode2(scene, "time controller");
  }
  get PLAY_EVENT_CONTEXT() {
    return this._PLAY_EVENT_CONTEXT = this._PLAY_EVENT_CONTEXT || {event: new Event(SceneEventType.PLAY)};
  }
  get PAUSE_EVENT_CONTEXT() {
    return this._PAUSE_EVENT_CONTEXT = this._PAUSE_EVENT_CONTEXT || {event: new Event(SceneEventType.PAUSE)};
  }
  get TICK_EVENT_CONTEXT() {
    return this._TICK_EVENT_CONTEXT = this._TICK_EVENT_CONTEXT || {event: new Event(SceneEventType.TICK)};
  }
  get graph_node() {
    return this._graph_node;
  }
  get frame() {
    return this._frame;
  }
  get time() {
    return this._time;
  }
  get frame_range() {
    return this._frame_range;
  }
  get frame_range_locked() {
    return this._frame_range_locked;
  }
  get realtime_state() {
    return this._realtime_state;
  }
  set_frame_range(start_frame, end_frame) {
    this._frame_range[0] = Math.floor(start_frame);
    this._frame_range[1] = Math.floor(end_frame);
    this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.FRAME_RANGE_UPDATED);
  }
  set_frame_range_locked(start_locked, end_locked) {
    this._frame_range_locked[0] = start_locked;
    this._frame_range_locked[1] = end_locked;
    this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.FRAME_RANGE_UPDATED);
  }
  set_realtime_state(state) {
    this._realtime_state = state;
    this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.REALTIME_STATUS_UPDATED);
  }
  set_time(time, update_frame = true) {
    if (time != this._time) {
      this._time = time;
      if (update_frame) {
        const new_frame = Math.floor(this._time * FPS);
        const bounded_frame = this._ensure_frame_within_bounds(new_frame);
        if (new_frame != bounded_frame) {
          this.set_frame(bounded_frame, true);
        } else {
          this._frame = new_frame;
        }
      }
      this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.FRAME_UPDATED);
      this.scene.uniforms_controller.update_time_dependent_uniform_owners();
      this.scene.cooker.block();
      this.graph_node.set_successors_dirty();
      this.scene.cooker.unblock();
      this.scene.events_dispatcher.scene_events_controller.process_event(this.TICK_EVENT_CONTEXT);
    }
  }
  set_frame(frame, update_time = true) {
    if (frame != this._frame) {
      frame = this._ensure_frame_within_bounds(frame);
      if (frame != this._frame) {
        this._frame = frame;
        if (update_time) {
          this.set_time(this._frame / FPS, false);
        }
      }
    }
  }
  increment_time_if_playing() {
    if (this._playing) {
      if (!this.scene.root.are_children_cooking()) {
        this.increment_time();
      }
    }
  }
  increment_time() {
    if (this._realtime_state) {
      const performance_now = performance.now();
      const delta = (performance_now - this._prev_performance_now) / 1e3;
      const new_time = this._time + delta;
      this._prev_performance_now = performance_now;
      this.set_time(new_time);
    } else {
      this.set_frame(this.frame + 1);
    }
  }
  _ensure_frame_within_bounds(frame) {
    if (this._frame_range_locked[0] && frame < this._frame_range[0]) {
      return this._frame_range[1];
    }
    if (this._frame_range_locked[1] && frame > this._frame_range[1]) {
      return this._frame_range[0];
    }
    return frame;
  }
  get playing() {
    return this._playing === true;
  }
  pause() {
    if (this._playing == true) {
      this._playing = false;
      this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.PLAY_STATE_UPDATED);
      this.scene.events_dispatcher.scene_events_controller.process_event(this.PAUSE_EVENT_CONTEXT);
    }
  }
  play() {
    if (this._playing !== true) {
      this._playing = true;
      this._prev_performance_now = performance.now();
      this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent2.PLAY_STATE_UPDATED);
      this.scene.events_dispatcher.scene_events_controller.process_event(this.PLAY_EVENT_CONTEXT);
    }
  }
  toggle_play_pause() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }
}
