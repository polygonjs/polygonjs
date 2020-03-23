// import {SceneContext} from '../../core/context/Scene';
import {PolyScene} from '../PolyScene';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {SceneEvent} from '../../poly/SceneEvent';
// import {BaseNode} from '../nodes/_Base'

type FrameRange = [number, number];

// ensure that FPS remains a float
// to have divisions and multiplications also give a float
const FPS = 60.0;

export class TimeController {
	protected self: PolyScene = (<unknown>this) as PolyScene;
	private _frame: number = 1;
	private _time: number = 0;
	private _performance_now: number = performance.now();
	private _prev_performance_now: number = this._performance_now;
	private _graph_node: CoreGraphNode;
	private _frame_range: FrameRange = [1, 600];
	private _frame_range_locked: [boolean, boolean] = [true, true];
	private _playing: boolean = false;
	// private _frame_interval: number = 1000 / 60;
	// private _next_frame_bound = this.play_next_frame.bind(this);

	constructor(private scene: PolyScene) {
		this._graph_node = new CoreGraphNode(scene, 'time controller');
		// this._graph_node.set_scene(this.scene);
	}
	get graph_node() {
		return this._graph_node;
	}

	// init() {
	// 	this._context = new SceneContext();
	// 	this._context.set_scene(this.scene);

	// 	this.set_frame_range(1, 240); //100 - 288*100-100
	// 	this.set_fps(60);
	// }
	// context() {
	// 	return this._context;
	// }
	// get fps(): number {
	// 	return this._fps;
	// }
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
	set_frame_range(start_frame: number, end_frame: number) {
		this._frame_range[0] = Math.floor(start_frame);
		this._frame_range[1] = Math.floor(end_frame);
		this.scene.events_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
	}
	set_frame_range_locked(start_locked: boolean, end_locked: boolean) {
		this._frame_range_locked[0] = start_locked;
		this._frame_range_locked[1] = end_locked;
		this.scene.events_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
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
				this.set_frame(Math.floor(this._time * FPS), false);
			}

			// update time dependents
			this.scene.events_controller.dispatch(this._graph_node, SceneEvent.FRAME_UPDATED);
			this.scene.uniforms_controller.update_time_dependent_uniform_owners();

			// we block updates here, so that dependent nodes only cook once
			this.scene.cooker.block();
			this.graph_node.set_successors_dirty();
			this.scene.cooker.unblock();
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
		this._performance_now = performance.now();
		const delta = this._performance_now - this._prev_performance_now;
		const new_time = (this._time + delta) / 1000.0;
		this.set_time(new_time);
	}
	// increment_frame(update_time = true) {
	// 	this.set_frame(this._frame + 1, update_time);
	// }
	// decrement_frame(update_time = true) {
	// 	this.set_frame(this.frame - 1, update_time);
	// }
	// set_first_frame() {
	// 	this.set_frame(this.frame_range[0]);
	// }
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
			this.scene.events_controller.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
		}
	}
	play() {
		// if (this._playing !== true) {
		// 	setTimeout(this.play_next_frame.bind(this), this._frame_interval);
		// }
		if (this._playing !== true) {
			this._playing = true;
			this.scene.events_controller.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
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
