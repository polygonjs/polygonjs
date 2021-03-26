import {PolyScene} from '../PolyScene';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {SceneEvent} from '../../poly/SceneEvent';
import {SceneEventType} from './events/SceneEventsController';
import {EventContext} from './events/_BaseEventsController';

// ensure that FPS remains a float
// to have divisions and multiplications also give a float
const FPS = 60.0;
export type onTimeTickHook = () => void;
export class TimeController {
	static START_FRAME: Readonly<number> = 0;
	private _frame: number = 0;
	private _time: number = 0;
	private _prev_performance_now: number = 0;
	private _graph_node: CoreGraphNode;
	private _realtimeState = true;
	private _maxFrame = 600;
	private _maxFrameLocked = false;
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
	}
	get graphNode() {
		return this._graph_node;
	}

	frame(): number {
		return this._frame;
	}
	time(): number {
		return this._time;
	}
	maxFrame() {
		return this._maxFrame;
	}
	maxFrameLocked() {
		return this._maxFrameLocked;
	}
	realtimeState() {
		return this._realtimeState;
	}
	setMaxFrame(maxFrame: number) {
		this._maxFrame = Math.floor(maxFrame);
		this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.MAX_FRAME_UPDATED);
	}
	setMaxFrameLocked(state: boolean) {
		this._maxFrameLocked = state;
		this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.MAX_FRAME_UPDATED);
	}
	setRealtimeState(state: boolean) {
		this._realtimeState = state;
		this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.REALTIME_STATUS_UPDATED);
	}
	// set_fps(fps: number) {
	// 	this._fps = Math.floor(fps);
	// 	this._frame_interval = 1000 / this._fps;
	// 	this.scene.events_controller.dispatch(this._graph_node, SceneEvent.FRAME_RANGE_UPDATED);
	// }
	setTime(time: number, update_frame = true) {
		if (time != this._time) {
			this._time = time;

			if (this._onBeforeTickCallbacks) {
				for (let callback of this._onBeforeTickCallbacks) {
					callback();
				}
			}

			if (update_frame) {
				const new_frame = Math.floor(this._time * FPS);
				const bounded_frame = this._ensureFrameWithinBounds(new_frame);
				if (new_frame != bounded_frame) {
					this.setFrame(bounded_frame, true);
				} else {
					this._frame = new_frame;
				}
			}

			// update time dependents
			this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.FRAME_UPDATED);
			this.scene.uniforms_controller.update_time_dependent_uniform_owners();

			// we block updates here, so that dependent nodes only cook once
			this.scene.cooker.block();
			this.graphNode.setSuccessorsDirty();
			this.scene.cooker.unblock();

			// dispatch events after nodes have cooked
			this.scene.eventsDispatcher.sceneEventsController.processEvent(this.TICK_EVENT_CONTEXT);

			if (this._onAfterTickCallbacks) {
				for (let callback of this._onAfterTickCallbacks) {
					callback();
				}
			}
		}
	}

	setFrame(frame: number, update_time = true) {
		if (frame != this._frame) {
			frame = this._ensureFrameWithinBounds(frame);
			if (frame != this._frame) {
				this._frame = frame;
				if (update_time) {
					this.setTime(this._frame / FPS, false);
				}
			}
		}
	}
	setFrameToStart() {
		this.setFrame(TimeController.START_FRAME, true);
	}
	incrementTimeIfPlaying() {
		if (this._playing) {
			if (!this.scene.root().areChildrenCooking()) {
				this.incrementTime();
			}
		}
	}
	incrementTime() {
		if (this._realtimeState) {
			const performance_now = performance.now();
			const delta = (performance_now - this._prev_performance_now) / 1000.0;
			const new_time = this._time + delta;
			this._prev_performance_now = performance_now;
			this.setTime(new_time);
		} else {
			this.setFrame(this.frame() + 1);
		}
	}

	_ensureFrameWithinBounds(frame: number): number {
		if (this._playing) {
			if (this._maxFrameLocked && frame > this._maxFrame) {
				return TimeController.START_FRAME;
			}
		} else {
			if (this._maxFrameLocked && frame > this._maxFrame) {
				return this._maxFrame;
			}
			if (frame < TimeController.START_FRAME) {
				return TimeController.START_FRAME;
			}
		}
		return frame;
	}
	playing() {
		return this._playing === true;
	}
	pause() {
		if (this._playing == true) {
			this._playing = false;
			// TODO: try and unify the dispatch controller and events dispatcher
			this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
			this.scene.eventsDispatcher.sceneEventsController.processEvent(this.PAUSE_EVENT_CONTEXT);
		}
	}
	play() {
		if (this._playing !== true) {
			this._playing = true;
			this._prev_performance_now = performance.now();
			this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
			this.scene.eventsDispatcher.sceneEventsController.processEvent(this.PLAY_EVENT_CONTEXT);
		}
	}
	togglePlayPause() {
		if (this.playing()) {
			this.pause();
		} else {
			this.play();
		}
	}

	//
	//
	// CALLBACKS
	//
	//
	private _onBeforeTickCallbackNames: string[] | undefined;
	private _onAfterTickCallbackNames: string[] | undefined;
	protected _onBeforeTickCallbacks: onTimeTickHook[] | undefined;
	protected _onAfterTickCallbacks: onTimeTickHook[] | undefined;

	registerOnBeforeTick(callbackName: string, callback: onTimeTickHook) {
		this._onBeforeTickCallbackNames = this._onBeforeTickCallbackNames || [];
		this._onBeforeTickCallbacks = this._onBeforeTickCallbacks || [];
		this._registerCallback(callbackName, callback, this._onBeforeTickCallbackNames, this._onBeforeTickCallbacks);
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbackNames, this._onBeforeTickCallbacks);
	}
	registeredBeforeTickCallbackNames() {
		return this._onBeforeTickCallbackNames;
	}
	registerOnAfterTick(callbackName: string, callback: onTimeTickHook) {
		this._onAfterTickCallbacks = this._onAfterTickCallbacks || [];
		this._onAfterTickCallbackNames = this._onAfterTickCallbackNames || [];
		this._registerCallback(callbackName, callback, this._onAfterTickCallbackNames, this._onAfterTickCallbacks);
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbackNames, this._onAfterTickCallbacks);
	}
	registeredAfterTickCallbackNames() {
		return this._onAfterTickCallbackNames;
	}

	private _registerCallback<C extends onTimeTickHook>(
		callbackName: string,
		callback: C,
		names: string[],
		callbacks: C[]
	) {
		if (names?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		callbacks.push(callback);
		names.push(callbackName);
	}
	private _unregisterCallback(callbackName: string, names?: string[], hooks?: onTimeTickHook[]) {
		if (!(names && hooks)) {
			return;
		}
		const index = names.indexOf(callbackName);
		names.splice(index, 1);
		hooks.splice(index, 1);
	}
}
