/**
 * Sends events related to the scene
 *
 *
 */
import {ACCEPTED_SCENE_EVENT_TYPES, SceneEventType} from '../../scene/utils/events/SceneEventsController';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {EventConnectionPoint, EventConnectionPointType, BaseEventConnectionPoint} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {TypedEventNode} from './_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {isBooleanTrue} from '../../../core/Type';

enum SceneNodeInput {
	SET_FRAME = 'setFrame',
}
enum SceneNodeOutput {
	TICK = 'tick',
	TIME_REACHED = 'timeReached',
}
const UPDATE_SCENE_EVENT_PARAM_OPTIONS: ParamOptions = {
	visibleIf: {active: 1},
	callback: (node: BaseNodeType) => {
		SceneEventNode.PARAM_CALLBACK_updateSceneEventsController(node as SceneEventNode);
	},
};
const UPDATE_TIME_DEPENDENCY_PARAM_OPTIONS: ParamOptions = {
	visibleIf: {active: 1},
	callback: (node: BaseNodeType) => {
		SceneEventNode.PARAM_CALLBACK_updateTimeDependency(node as SceneEventNode);
	},
};

interface OnTickCallbackBuilderOptions {
	tick: boolean;
	treachedTime: boolean;
	reachedTime: number;
}

class SceneEventParamsConfig extends NodeParamsConfig {
	/** @param toggle on to allow any event to be listened to */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			SceneEventNode.PARAM_CALLBACK_updateActiveState(node as SceneEventNode);
		},
		separatorAfter: true,
	});
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(0, {
		hidden: true,
	});
	/** @param toggle on to trigger an event when the scene has loaded. This can be useful to initialize other nodes */
	sceneLoaded = ParamConfig.BOOLEAN(1, UPDATE_SCENE_EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event when the scene starts playing */
	play = ParamConfig.BOOLEAN(1, UPDATE_SCENE_EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event when the scene pauses */
	pause = ParamConfig.BOOLEAN(1, UPDATE_SCENE_EVENT_PARAM_OPTIONS);
	/** @param toggle on to trigger an event on every tick */
	tick = ParamConfig.BOOLEAN(1, {
		separatorAfter: true,
		...UPDATE_TIME_DEPENDENCY_PARAM_OPTIONS,
	});
	/** @param toggle on to trigger an event on every tick */
	treachedTime = ParamConfig.BOOLEAN(0, UPDATE_TIME_DEPENDENCY_PARAM_OPTIONS);
	/** @param time to trigger an event */
	reachedTime = ParamConfig.FLOAT(10, {
		visibleIf: {treachedTime: 1},
		range: [0, 100],
		separatorAfter: true,
		...UPDATE_TIME_DEPENDENCY_PARAM_OPTIONS,
	});
	/** @param frame to set */
	setFrameValue = ParamConfig.INTEGER(1, {
		range: [0, 100],
	});
	/** @param button to set a specific frame */
	setFrame = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SceneEventNode.PARAM_CALLBACK_setFrame(node as SceneEventNode);
		},
	});
}
const ParamsConfig = new SceneEventParamsConfig();

export class SceneEventNode extends TypedEventNode<SceneEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'scene';
	}

	private _graphNode: CoreGraphNode | undefined;

	dispose() {
		this._graphNode?.dispose();
		super.dispose();
	}

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				SceneNodeInput.SET_FRAME,
				EventConnectionPointType.BASE,
				this._onSetFrame.bind(this)
			),
			new EventConnectionPoint(SceneEventType.PLAY, EventConnectionPointType.BASE, this._play.bind(this)),
			new EventConnectionPoint(SceneEventType.PAUSE, EventConnectionPointType.BASE, this._pause.bind(this)),
		]);
		const outConnectionPoints: BaseEventConnectionPoint[] = ACCEPTED_SCENE_EVENT_TYPES.map((event_type) => {
			return new EventConnectionPoint(event_type, EventConnectionPointType.BASE);
		});
		outConnectionPoints.push(new EventConnectionPoint(SceneNodeOutput.TICK, EventConnectionPointType.BASE));
		outConnectionPoints.push(new EventConnectionPoint(SceneNodeOutput.TIME_REACHED, EventConnectionPointType.BASE));
		this.io.outputs.setNamedOutputConnectionPoints(outConnectionPoints);

		this.params.onParamsCreated('updateTimeDependency', () => {
			this._updateTimeDependency();
		});
		this._updateSceneEventsController();

		// register/unregister
		const register = () => {
			this._updateSceneEventsController();
		};
		const unregister = () => {
			const eventsController = this.scene().eventsDispatcher.sceneEventsController;
			eventsController.removeObserverFromAllEventTypes(this);
		};
		this.lifecycle.onAfterAdded(register);
		this.lifecycle.onBeforeDeleted(unregister);
	}

	processEvent(eventContext: EventContext<Event>) {
		if (!this.pv.active) {
			return;
		}
		if (!eventContext.event) {
			return;
		}

		this.dispatchEventToOutput(eventContext.event.type, eventContext);
	}

	private _onSetFrame(eventContext: EventContext<Event>) {
		this.scene().setFrame(this.pv.setFrameValue);
	}
	private _play(eventContext: EventContext<Event>) {
		this.scene().play();
	}
	private _pause(eventContext: EventContext<Event>) {
		this.scene().pause();
	}

	private _timeReached = false;
	private _onTickCheckTimeReached(time: number, reachedTime: number) {
		if (time >= this.pv.reachedTime) {
			if (!this._timeReached) {
				this._timeReached = true;
				this.dispatchEventToOutput(SceneNodeOutput.TIME_REACHED, {});
			}
		} else {
			this._timeReached = false;
		}
	}
	private _onTickEvent() {
		this.dispatchEventToOutput(SceneNodeOutput.TICK, {});
	}

	private _updateTimeDependency() {
		const timeGraphNode = this.scene().timeController.graphNode;
		this._graphNode?.removeGraphInput(timeGraphNode);
		if (!isBooleanTrue(this.pv.active)) {
			return;
		}

		if (isBooleanTrue(this.pv.treachedTime) || isBooleanTrue(this.pv.tick)) {
			this._graphNode = this._graphNode || new CoreGraphNode(this.scene(), 'sceneNodeTimeGraphNode');
			this._graphNode.addGraphInput(timeGraphNode);

			const options: OnTickCallbackBuilderOptions = {
				tick: this.pv.tick,
				treachedTime: this.pv.treachedTime,
				reachedTime: this.pv.reachedTime,
			};

			const callback = this._buildOnTickCallback(options)?.bind(this);
			if (callback) {
				const callbackName = 'timeUpdate';
				this._graphNode.removePostDirtyHook(callbackName);
				this._graphNode.addPostDirtyHook(callbackName, callback);
			}
		}
	}
	private _buildOnTickCallback(options: OnTickCallbackBuilderOptions) {
		if (isBooleanTrue(options.treachedTime) && isBooleanTrue(options.tick)) {
			return () => {
				const time = this.scene().time();
				this._onTickEvent();
				this._onTickCheckTimeReached(time, options.reachedTime);
			};
		} else {
			if (isBooleanTrue(options.treachedTime)) {
				return () => {
					const time = this.scene().time();
					this._onTickCheckTimeReached(time, options.reachedTime);
				};
			}
			if (isBooleanTrue(options.tick)) {
				return this._onTickEvent.bind(this);
			}
		}
	}

	static PARAM_CALLBACK_setFrame(node: SceneEventNode) {
		node._onSetFrame({});
	}
	static PARAM_CALLBACK_updateTimeDependency(node: SceneEventNode) {
		node._updateTimeDependency();
	}

	static PARAM_CALLBACK_updateSceneEventsController(node: SceneEventNode) {
		node._updateSceneEventsController();
	}
	static PARAM_CALLBACK_updateActiveState(node: SceneEventNode) {
		node._updateTimeDependency();
		node._updateSceneEventsController();
	}

	private _updateSceneEventsController() {
		const eventsController = this.scene().eventsDispatcher.sceneEventsController;
		eventsController.removeObserverFromAllEventTypes(this);
		if (!this.pv.active) {
			return;
		}
		this._updateTimeDependency();
		// if (isBooleanTrue(this.pv.tick)) {
		// 	eventsController.addObserver(this, SceneEventType.TICK);
		// }
		if (isBooleanTrue(this.pv.sceneLoaded)) {
			eventsController.addObserver(this, SceneEventType.LOADED);
		}
		if (isBooleanTrue(this.pv.play)) {
			eventsController.addObserver(this, SceneEventType.PLAY);
		}
		if (isBooleanTrue(this.pv.pause)) {
			eventsController.addObserver(this, SceneEventType.PAUSE);
		}
	}
}
