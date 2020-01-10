// import {SceneContext} from 'src/core/context/Scene';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {CoreGraphNodeScene} from 'src/core/graph/CoreGraphNodeScene';
// import {BaseNode} from 'src/engine/nodes/_Base'

type FrameRange = [number, number];

export class TimeController {
	protected self: PolyScene = (<unknown>this) as PolyScene;
	_frame: number;
	_graph_node_scene: CoreGraphNodeScene;
	_frame_range: FrameRange = [1, 600];
	_frame_range_locked: [boolean, boolean] = [true, true];
	_playing: boolean = false;
	private _fps: number = 60;
	private _frame_interval: number = 1000 / 60;

	constructor(private scene: PolyScene) {
		this._graph_node_scene = new CoreGraphNodeScene();
		this._graph_node_scene.set_scene(this.scene);
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
	get fps(): number {
		return this._fps;
	}
	get frame(): number {
		return this._frame;
	}
	get time(): number {
		return this._frame / this._fps;
	}
	get frame_range(): FrameRange {
		return this._frame_range;
	}
	get frame_range_locked(): [boolean, boolean] {
		return this._frame_range_locked;
	}
	set_frame_range(start_frame: number, end_frame: number) {
		this._frame_range = [Math.floor(start_frame), Math.floor(end_frame)];
		this.scene.emit_controller.store_commit('scene_frame_range_updated');
	}
	set_frame_range_locked(start_locked: boolean, end_locked: boolean) {
		this._frame_range_locked = [start_locked, end_locked];
		this.scene.emit_controller.store_commit('scene_frame_range_updated');
	}
	set_fps(fps: number) {
		this._fps = Math.floor(fps);
		this._frame_interval = 1000 / this._fps;
		this.scene.emit_controller.store_commit('scene_frame_range_updated'); // TODO: typescript: replace with a more generic name dispatch_event
	}

	set_frame(frame: number) {
		frame = this._ensure_frame_within_bounds(frame);
		if (frame != this.frame) {
			this._frame = frame;
			this.scene.emit_controller.store_commit('scene_frame_updated');
			this.scene.uniforms_controller.update_frame_dependent_uniform_owners();
		}
	}
	increment_frame() {
		// let frame = this._context.frame() + 1;
		// frame = this._ensure_frame_within_bounds(frame);
		this.set_frame(this.frame + 1);
	}
	decrement_frame() {
		this.set_frame(this.frame - 1);
		// let frame = this._context.frame() - 1;
		// frame = this._ensure_frame_within_bounds(frame);
		// this.set_frame(frame);
	}
	set_first_frame() {
		this.set_frame(this.frame_range[0]);
	}
	_ensure_frame_within_bounds(frame: number): number {
		if (this._frame_range_locked[0] && frame < this._frame_range[0]) {
			frame = this._frame_range[1];
		}
		if (this._frame_range_locked[1] && frame > this._frame_range[1]) {
			frame = this._frame_range[0];
		}
		return frame;
	}
	get playing() {
		return this._playing === true;
	}
	pause() {
		this._playing = false;
		this.scene.emit_controller.store_commit('scene_play_state_updated');
	}
	play() {
		if (this._playing !== true) {
			setTimeout(this.play_next_frame.bind(this), this._frame_interval);
		}
		this._playing = true;
		this.scene.emit_controller.store_commit('scene_play_state_updated');
	}
	toggle_play_pause() {
		if (this.playing) {
			this.pause();
		} else {
			this.play();
		}
	}

	play_next_frame() {
		//current_time = performance.now()
		//if !@_last_time_frame_incremented? || ( (current_time - @_last_time_frame_incremented) > 40 )
		if (this.playing) {
			//@_last_time_frame_incremented = current_time
			if (!this.scene.root.are_children_cooking()) {
				this.increment_frame();
			}

			setTimeout(this.play_next_frame.bind(this), this._frame_interval);
		}
	}
}
