import {PolyScene} from '../PolyScene';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {SceneEvent} from '../../poly/SceneEvent';
import {Clock} from 'three';
import {SCENE_EVENT_PLAY_EVENT_CONTEXT, SCENE_EVENT_PAUSE_EVENT_CONTEXT} from './events/SceneEventsController';

// ensure that FPS remains a float
// to have divisions and multiplications also give a float
const FPS = 60.0;
export const DESIRED_FPS = 60.0;
const MAX_DELTA = 0.1;
export type onTimeTickHook = (delta: number) => void;
export type onPlayingStateChangeCallback = () => void;
// const performance = Poly.performance.performanceManager();

export interface TimeControllerUpdateTimeOptions {
	updateClockDelta?: boolean;
}
export const TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT: TimeControllerUpdateTimeOptions = {
	updateClockDelta: false,
};

type onTimeTickCallbacksMap = Map<string, onTimeTickHook>;
export class TimeController {
	static START_FRAME: Readonly<number> = 0;
	private _frame: number = 0;
	private _timeUniform = {value: 0};
	private _graphNode: CoreGraphNode;
	private _realtimeState = true;
	private _maxFrame = 600;
	private _maxFrameLocked = false;
	private _playing: boolean = false;
	private _clock = new Clock();
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
		this._graphNode = new CoreGraphNode(scene, 'timeController');
	}
	get graphNode() {
		return this._graphNode;
	}
	updateClockDelta() {
		const delta = this._clock.getDelta();
		const clampedDelta = delta > MAX_DELTA ? MAX_DELTA : delta;
		return (this._delta = clampedDelta);
	}
	delta() {
		return this._delta;
	}
	setDelta(delta: number) {
		this._delta = delta;
	}

	frame(): number {
		return this._frame;
	}
	timeUniform() {
		return this._timeUniform;
	}
	time(): number {
		return this._timeUniform.value;
	}
	timeDelta() {
		return this._delta;
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
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.MAX_FRAME_UPDATED);
	}
	setMaxFrameLocked(state: boolean) {
		this._maxFrameLocked = state;
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.MAX_FRAME_UPDATED);
	}
	setRealtimeState(state: boolean) {
		this._realtimeState = state;
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.REALTIME_STATUS_UPDATED);
	}

	setTime(time: number, updateFrame = true) {
		if (time == this._timeUniform.value) {
			return;
		}
		this._timeUniform.value = time;

		// we block updates here, so that dependent nodes only cook once
		this.scene.cooker.block();
		const delta = this._delta;
		for (const callback of this._onBeforeTickCallbacks) {
			callback(delta);
		}
		if (this._playing == true && time > 0) {
			this.scene.actorsManager.tick();
		}

		if (updateFrame) {
			const newFrame = Math.floor(this._timeUniform.value * FPS);
			const boundedFrame = this._ensureFrameWithinBounds(newFrame);
			if (newFrame != boundedFrame) {
				this.setFrame(boundedFrame, true);
			} else {
				this._frame = newFrame;
			}
		}

		// update time dependents
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.FRAME_UPDATED);
		// this.scene.uniformsController.updateTime();

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
		if (this._frame == TimeController.START_FRAME) {
			this.scene.actorsManager.runOnEventSceneReset();
		}

		if (updateTime) {
			this.setTime(this._frame / FPS, false);
		}
	}
	setFrameToStart() {
		this.setFrame(TimeController.START_FRAME, true);
	}
	incrementTimeIfPlaying(options?: TimeControllerUpdateTimeOptions) {
		if (this._playing) {
			if (!this.scene.root().areChildrenCooking()) {
				this.incrementTime(options);
			}
		}
	}
	incrementTime(options?: TimeControllerUpdateTimeOptions) {
		if (!(options?.updateClockDelta == false)) {
			this.updateClockDelta();
		}

		if (this._realtimeState) {
			// const performance_now = performance.now();
			const newTime = this._timeUniform.value + this._delta;
			// this._prev_performance_now = performance_now;
			this.setTime(newTime, false);
			this.setFrame(this._frame + 1, false);
		} else {
			this.setFrame(this.frame() + 1);
		}
	}

	private _ensureFrameWithinBounds(frame: number): number {
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
		if (this._playing == false) {
			return;
		}
		this._playing = false;
		// TODO: try and unify the dispatch controller and events dispatcher
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.PLAY_STATE_UPDATED);
		this.scene.actorsManager.runOnEventScenePause();
		this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_PAUSE_EVENT_CONTEXT);
		for (let callback of this._onPlayingStateChangeCallbacks) {
			callback();
		}
	}
	play() {
		if (this._playing == true) {
			return;
		}
		this._playing = true;
		this.scene.actorsManager.runOnEventScenePlay();
		this.scene.dispatchController.dispatch(this._graphNode, SceneEvent.PLAY_STATE_UPDATED);
		this.scene.eventsDispatcher.sceneEventsController.dispatch(SCENE_EVENT_PLAY_EVENT_CONTEXT);
		for (let callback of this._onPlayingStateChangeCallbacks) {
			callback();
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
	private _onBeforeTickCallbacksMap: onTimeTickCallbacksMap | undefined;
	private _onAfterTickCallbacksMap: onTimeTickCallbacksMap | undefined;
	private _onPlayingStateChangeCallbacksMap: Set<onPlayingStateChangeCallback> | undefined;
	private _onBeforeTickCallbacks: Array<onTimeTickHook> = [];
	private _onAfterTickCallbacks: Array<onTimeTickHook> = [];
	private _onPlayingStateChangeCallbacks: Array<onPlayingStateChangeCallback> = [];

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
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || (new Map() as onTimeTickCallbacksMap));
	}
	onPlayingStateChange(callback: onPlayingStateChangeCallback) {
		this._onPlayingStateChangeCallbacksMap = this._onPlayingStateChangeCallbacksMap || new Set();
		this._onPlayingStateChangeCallbacksMap.add(callback);
		this._updateOnPlayingStateChangeCallbacks();
	}
	removeOnPlayingStateChange(callback: onPlayingStateChangeCallback) {
		if (this._onPlayingStateChangeCallbacksMap) {
			this._onPlayingStateChangeCallbacksMap.delete(callback);
			this._updateOnPlayingStateChangeCallbacks();
		}
	}
	private _updateOnPlayingStateChangeCallbacks() {
		this._onPlayingStateChangeCallbacks = [];
		if (this._onPlayingStateChangeCallbacksMap) {
			this._onPlayingStateChangeCallbacksMap.forEach((callback) => {
				this._onPlayingStateChangeCallbacks.push(callback);
			});
		}
	}

	private _registerCallback<C extends onTimeTickHook>(
		callbackName: string,
		callback: C,
		map: onTimeTickCallbacksMap
	) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, callback);
		this._updateCallbacks();
	}
	private _unregisterCallback(callbackName: string, map?: onTimeTickCallbacksMap) {
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
