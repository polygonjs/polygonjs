/**
 * sends triggers on keypress/keydown for WASD, arrow keys as well as space and shift keys
 *
 *
 */

import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {KeyboardEventType} from '../../../core/event/KeyboardEventType';
import {BaseUserInputActorNode} from './_BaseUserInput';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
import {CORE_PLAYER_INPUTS, CorePlayerInput, CorePlayerInputData} from '../../../core/player/PlayerSimple';
import {isBooleanTrue} from '../../../core/Type';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

type EventFunction = () => void;
interface onEvent {
	forward: EventFunction;
	backward: EventFunction;
	left: EventFunction;
	right: EventFunction;
	jump: EventFunction;
	run: EventFunction;
}
interface onStartEndEvents {
	start: onEvent;
	end: onEvent;
}
// type AllowedKeyCode = 'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight'|'KeyW'|'KeyS'|'KeyA'|'KeyD'
interface ArrowEvents {
	ArrowUp: EventFunction;
	ArrowDown: EventFunction;
	ArrowLeft: EventFunction;
	ArrowRight: EventFunction;
}
interface WASDEvents {
	KeyW: EventFunction;
	KeyS: EventFunction;
	KeyA: EventFunction;
	KeyD: EventFunction;
}
interface JumpRunEvents {
	ShiftLeft: EventFunction;
	ShiftRight: EventFunction;
	Space: EventFunction;
}
interface JumpRunEvents {
	ShiftLeft: EventFunction;
	ShiftRight: EventFunction;
	Space: EventFunction;
}
class BaseOnKeyEventActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
	/** @param define if WASD keys are used or not */
	useWASDkeys = ParamConfig.BOOLEAN(1);
	/** @param define if Arrow keys are used or not */
	useArrowkeys = ParamConfig.BOOLEAN(1);
	/** @param prevent event propagation */
	stopPropagation = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new BaseOnKeyEventActorParamsConfig();

export class OnPlayerEventActorNode extends BaseUserInputActorNode<BaseOnKeyEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_PLAYER_EVENT;
	}
	private _playerInputData: CorePlayerInputData = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		run: false,
		jump: false,
	};
	userInputEventNames() {
		return [KeyboardEventType.keydown, KeyboardEventType.keyup];
	}
	override eventEmitter(): CoreEventEmitter {
		return EVENT_EMITTERS[this.pv.element];
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['element', 'useWASDkeys', 'useArrowkeys']);
		this.io.outputs.setNamedOutputConnectionPoints([
			// new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			...CORE_PLAYER_INPUTS.map(
				(inputName) => new ActorConnectionPoint(inputName, ActorConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);
	}
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const events = this.scene().eventsDispatcher.keyboardEventsController.currentEvents();
		if (events.length == 0) {
			return;
		}

		for (let event of events) {
			if (event.ctrlKey) {
				// if ctrl is pressed, we do not register any event.
				// this is mostly to allow Ctrl+S to work without triggering a player movement
				return;
			}
			const callbackMethod = this._callbackByEventType[event.type as 'keydown' | 'keyup'];
			if (!callbackMethod) {
				return;
			}
			const callback = callbackMethod(event.code);
			if (callback) {
				callback();
				if (isBooleanTrue(this.pv.stopPropagation)) {
					event.stopPropagation();
					event.preventDefault();
				}
			}
		}
	}
	public override outputValue(context: ActorNodeTriggerContext, outputName: CorePlayerInput): boolean {
		return this._playerInputData[outputName] || false;
	}

	private _callbackByEventType = {
		keydown: (code: string) => this._onKeydownCallback(code),
		keyup: (code: string) => this._onKeyupCallback(code),
	};
	private _onKeydownCallback(keyCode: string): EventFunction | undefined {
		const jumpRunKeyCallback = this._runJumpEventByKeyOnkeydown[keyCode as keyof JumpRunEvents];
		if (jumpRunKeyCallback) {
			return jumpRunKeyCallback;
		}
		if (isBooleanTrue(this.pv.useWASDkeys)) {
			const wasdKeyCallback = this._eventByWASNKeyOnKeydown[keyCode as keyof WASDEvents];
			if (wasdKeyCallback) {
				return wasdKeyCallback;
			}
		}
		if (isBooleanTrue(this.pv.useArrowkeys)) {
			const arrowKeyCallback = this._eventByArrowKeyOnKeydown[keyCode as keyof ArrowEvents];
			if (arrowKeyCallback) {
				return arrowKeyCallback;
			}
		}
	}
	private _onKeyupCallback(keyCode: string): EventFunction | undefined {
		const jumpRunKeyCallback = this._runJumpEventByKeyOnkeyup[keyCode as keyof JumpRunEvents];
		if (jumpRunKeyCallback) {
			return jumpRunKeyCallback;
		}
		if (isBooleanTrue(this.pv.useWASDkeys)) {
			const wasdKeyCallback = this._eventByWASNKeyOnKeyup[keyCode as keyof WASDEvents];
			if (wasdKeyCallback) {
				return wasdKeyCallback;
			}
		}
		if (isBooleanTrue(this.pv.useArrowkeys)) {
			const arrowKeyCallback = this._eventByArrowKeyOnKeyup[keyCode as keyof ArrowEvents];
			if (arrowKeyCallback) {
				return arrowKeyCallback;
			}
		}
	}

	private _onEvent: onStartEndEvents = {
		start: {
			forward: this._onForwardStart.bind(this),
			backward: this._onBackwardStart.bind(this),
			left: this._onLeftStart.bind(this),
			right: this._onRightStart.bind(this),
			jump: this._onJumpStart.bind(this),
			run: this._onRunStart.bind(this),
		},
		end: {
			forward: this._onForwardEnd.bind(this),
			backward: this._onBackwardEnd.bind(this),
			left: this._onLeftEnd.bind(this),
			right: this._onRightEnd.bind(this),
			jump: this._onJumpEnd.bind(this),
			run: this._onRunEnd.bind(this),
		},
	};
	private _eventByArrowKeyOnKeydown: ArrowEvents = {
		ArrowUp: this._onEvent.start.forward,
		ArrowDown: this._onEvent.start.backward,
		ArrowLeft: this._onEvent.start.left,
		ArrowRight: this._onEvent.start.right,
	};
	private _eventByWASNKeyOnKeydown: WASDEvents = {
		KeyW: this._onEvent.start.forward,
		KeyS: this._onEvent.start.backward,
		KeyA: this._onEvent.start.left,
		KeyD: this._onEvent.start.right,
	};
	private _eventByArrowKeyOnKeyup: ArrowEvents = {
		ArrowUp: this._onEvent.end.forward,
		ArrowDown: this._onEvent.end.backward,
		ArrowLeft: this._onEvent.end.left,
		ArrowRight: this._onEvent.end.right,
	};
	private _eventByWASNKeyOnKeyup: WASDEvents = {
		KeyW: this._onEvent.end.forward,
		KeyS: this._onEvent.end.backward,
		KeyA: this._onEvent.end.left,
		KeyD: this._onEvent.end.right,
	};
	private _runJumpEventByKeyOnkeydown: JumpRunEvents = {
		ShiftLeft: this._onEvent.start.run,
		ShiftRight: this._onEvent.start.run,
		Space: this._onEvent.start.jump,
	};
	private _runJumpEventByKeyOnkeyup: JumpRunEvents = {
		ShiftLeft: this._onEvent.end.run,
		ShiftRight: this._onEvent.end.run,
		Space: this._onEvent.end.jump,
	};
	private _onForwardStart() {
		this._playerInputData.forward = true;
	}
	private _onBackwardStart() {
		this._playerInputData.backward = true;
	}
	private _onLeftStart() {
		this._playerInputData.left = true;
	}
	private _onRightStart() {
		this._playerInputData.right = true;
	}
	private _onJumpStart() {
		this._playerInputData.jump = true;
	}
	private _onRunStart() {
		this._playerInputData.run = true;
	}
	private _onForwardEnd() {
		this._playerInputData.forward = false;
	}
	private _onBackwardEnd() {
		this._playerInputData.backward = false;
	}
	private _onLeftEnd() {
		this._playerInputData.left = false;
	}
	private _onRightEnd() {
		this._playerInputData.right = false;
	}
	private _onJumpEnd() {
		this._playerInputData.jump = false;
	}
	private _onRunEnd() {
		this._playerInputData.run = false;
	}
}
