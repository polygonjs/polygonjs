import {PolyScene} from '../PolyScene';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {SceneEvent} from '../../poly/SceneEvent';
// import {SceneEventType} from './events/SceneEventsController';
// import {EventContext} from './events/_BaseEventsController';
import {
	SCENE_EVENT_PLAY_EVENT_CONTEXT,
	SCENE_EVENT_PAUSE_EVENT_CONTEXT,
	// SCENE_EVENT_TICK_EVENT_CONTEXT,
} from './events/SceneEventsController';

// ensure that FPS remains a float
// to have divisions and multiplications also give a float
const FPS = 60.0;
export type onTimeTickHook = (delta: number) => void;
// const performance = Poly.performance.performanceManager();

type CallbacksMap = Map<string, onTimeTickHook>;
export class TimeController {
	static START_FRAME: Readonly<number> = 0;
	private _frame: number = 0;
	private _time: number = 0;
	// private _prev_performance_now: number = 0;
	private _graph_node: CoreGraphNode;
	private _realtimeState = true;
	private _maxFrame = 600;
	private _maxFrameLocked = false;
	private _playing: boolean = false;
	private _delta: number = 0;

	// private _PLAY_EVENT_CONTEXT: EventContext<SceneEvent> | undefined;
	// private _PAUSE_EVENT_CONTEXT: EventContext<SceneEvent> | undefined;
	// private _TICK_EVENT_CONTEXT: EventContext<SceneEvent> | undefined;
	// get PLAY_EVENT_CONTEXT() {
	// 	return (this._PLAY_EVENT_CONTEXT = this._PLAY_EVENT_CONTEXT || {event: new SceneEvent(SceneEventType.PLAY)});
	// }
	// get PAUSE_EVENT_CONTEXT() {
	// 	return (this._PAUSE_EVENT_CONTEXT = this._PAUSE_EVENT_CONTEXT || {event: new SceneEvent(SceneEventType.PAUSE)});
	// }
	// get TICK_EVENT_CONTEXT() {
	// 	return (this._TICK_EVENT_CONTEXT = this._TICK_EVENT_CONTEXT || {event: new SceneEvent(SceneEventType.TICK)});
	// }

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
	setTime(time: number, updateFrame = true) {
		if (time == this._time) {
			return;
		}
		this._time = time;

		// we block updates here, so that dependent nodes only cook once
		this.scene.cooker.block();
		const delta = this._delta;
		for (const callback of this._onBeforeTickCallbacks) {
			callback(delta);
		}

		if (updateFrame) {
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
		this.scene.uniformsController.updateTimeDependentUniformOwners();

		this.graphNode.setSuccessorsDirty();
		this.scene.cooker.unblock();

		// dispatch events after nodes have cooked
		// this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_TICK_EVENT_CONTEXT);

		for (const callback of this._onAfterTickCallbacks) {
			callback(delta);
		}
	}

	setFrame(frame: number, updateTime = true) {
		if (frame == this._frame) {
			return;
		}
		frame = this._ensureFrameWithinBounds(frame);
		if (frame == this._frame) {
			return;
		}
		this._frame = frame;
		if (updateTime) {
			this.setTime(this._frame / FPS, false);
		}
	}
	setFrameToStart() {
		this.setFrame(TimeController.START_FRAME, true);
	}
	incrementTimeIfPlaying(delta: number) {
		if (this._playing) {
			if (!this.scene.root().areChildrenCooking()) {
				this.incrementTime(delta);
			}
		}
	}
	incrementTime(delta: number) {
		if (this._realtimeState) {
			// const performance_now = performance.now();
			this._delta = delta;
			const newTime = this._time + this._delta;
			// this._prev_performance_now = performance_now;
			this.setTime(newTime);
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
			this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_PLAY_EVENT_CONTEXT);
		}
	}
	play() {
		if (this._playing !== true) {
			this._playing = true;
			this.scene.dispatchController.dispatch(this._graph_node, SceneEvent.PLAY_STATE_UPDATED);
			this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_PAUSE_EVENT_CONTEXT);
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
	private _onBeforeTickCallbacksMap: CallbacksMap | undefined;
	private _onAfterTickCallbacksMap: CallbacksMap | undefined;
	private _onBeforeTickCallbacks: Array<onTimeTickHook> = [];
	private _onAfterTickCallbacks: Array<onTimeTickHook> = [];

	registerOnBeforeTick(callbackName: string, callback: onTimeTickHook) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks());
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacksMap);
	}
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacksMap = this._onBeforeTickCallbacksMap || new Map());
	}
	registerOnAfterTick(callbackName: string, callback: onTimeTickHook) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks());
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacksMap);
	}
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || (new Map() as CallbacksMap));
	}

	private _registerCallback<C extends onTimeTickHook>(callbackName: string, callback: C, map: CallbacksMap) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, callback);
		this._updateCallbacks();
	}
	private _unregisterCallback(callbackName: string, map?: CallbacksMap) {
		if (!map) {
			return;
		}
		map.delete(callbackName);
		this._updateCallbacks();
	}
	private _updateCallbacks() {
		this._onBeforeTickCallbacks = [];
		this._onBeforeTickCallbacksMap?.forEach((callback) => {
			this._onBeforeTickCallbacks.push(callback);
		});
		this._onAfterTickCallbacks = [];
		this._onAfterTickCallbacksMap?.forEach((callback) => {
			this._onAfterTickCallbacks.push(callback);
		});
	}
}
