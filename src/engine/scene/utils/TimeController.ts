import {PolyScene} from '../PolyScene';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {SceneEvent} from '../../poly/SceneEvent';
import {SceneEventType} from './events/SceneEventsController';
import {EventContext} from './events/_BaseEventsController';

type FrameRange = Number2;

// ensure that FPS remains a float
// to have divisions and multiplications also give a float
const FPS = 60.0;

export class TimeController {
	private _frame: number = 1;
	private _time: number = 0;
	private _prev_performance_now: number = 0;
	private _graph_node: CoreGraphNode;
	private _frame_range: FrameRange = [1, 600];
	private _realtime_state = true;
	private _frame_range_locked: [boolean, boolean] = [true, true];
	private _playing: boolean = false;

	private _PLAY_EVENT_CONTEXT: EventContext<Event> | undefined;
	private _PAUSE_EVENT_CONTEXT: EventContext<Event> | undefined;
	private _TICK_EVENT_CONTEXT: EventContext<Event> | undefined;
	get PLAY_EVENT_CONTEXT() {
		return (this._PLAY_EVENT_CONTEXT = this._PLAY_EVENT_CONTEXT || {event: new Event(SceneEventType.PLAY)});
	}
	get PAUSE_EVENT_CONTEXT() {
		return (this._PAUSE_EVENT_CONTEXT = this._PAUSE_EVENT_CONTEXT || {event: new Event(SceneEventType.PAUSE)});
	}
	get TICK_EVENT_CONTEXT() {
		return (this._TICK_EVENT_CONTEXT = this._TICK_EVENT_CONTEXT || {event: new Event(SceneEventType.TICK)});
	}

	constructor(private scene: PolyScene) {
		this._graph_node = new CoreGraphNode(scene, 'time controller');
		// this._graph_node.set_scene(this.scene);
	}
	get graph_node() {
		return this._graph_node;
	}

	get frame(): number {
		return this._frame;
	}
	get time(): number {
		return this._time;
	}
	get frame_range(): FrameRange {
		return this._frame_range;
	}
	get frame_range_locked(): [boolean, boolean] {
		return this._frame_range_locked;
	}
	get realtime_state() {
		return this._realtime_state;
	}
	set_frame_range(start_frame: number, end_frame: number) {
		this._frame_range[0] = Math.floor(start_frame);
		this._frame_range[1] = Math.floor(end_frame);
		this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
	}
	set_frame_range_locked(start_locked: boolean, end_locked: boolean) {
		this._frame_range_locked[0] = start_locked;
		this._frame_range_locked[1] = end_locked;
		this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
	}
	set_realtime_state(state: boolean) {
		this._realtime_state = state;
		this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.REALTIME_STATUS_UPDATED);
	}
	// set_fps(fps: number) {
	// 	this._fps = Math.floor(fps);
	// 	this._frame_interval = 1000 / this._fps;
	// 	this.scene.events_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
	// }
	set_time(time: number, update_frame = true) {
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

			// update time dependents
			this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.FRAME_UPDATED);
			this.scene.uniforms_controller.update_time_dependent_uniform_owners();

			// we block updates here, so that dependent nodes only cook once
			this.scene.cooker.block();
			this.graph_node.set_successors_dirty();
			this.scene.cooker.unblock();

			// dispatch events after nodes have cooked
			this.scene.events_dispatcher.scene_events_controller.process_event(this.TICK_EVENT_CONTEXT);
		}
	}

	set_frame(frame: number, update_time = true) {
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
			const delta = (performance_now - this._prev_performance_now) / 1000.0;
			const new_time = this._time + delta;
			this._prev_performance_now = performance_now;
			this.set_time(new_time);
		} else {
			this.set_frame(this.frame + 1);
		}
	}

	_ensure_frame_within_bounds(frame: number): number {
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
			// TODO: try and unify the dispatch controller and events dispatcher
			this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
			this.scene.events_dispatcher.scene_events_controller.process_event(this.PAUSE_EVENT_CONTEXT);
		}
	}
	play() {
		if (this._playing !== true) {
			this._playing = true;
			this._prev_performance_now = performance.now();
			this.scene.dispatch_controller.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
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
