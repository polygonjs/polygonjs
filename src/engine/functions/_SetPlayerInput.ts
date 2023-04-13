import {Object3D} from 'three';
import {ref} from '../../core/reactivity/CoreReactivity';
import {Ref} from '@vue/reactivity';
// import {isBooleanTrue} from '../../core/Type';
import {ObjectNamedFunction0} from './_Base';

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

interface CorePlayerInputDataRef {
	forward: Ref<boolean>;
	backward: Ref<boolean>;
	left: Ref<boolean>;
	right: Ref<boolean>;
	run: Ref<boolean>;
	jump: Ref<boolean>;
}
function _createInputData(): CorePlayerInputDataRef {
	return {
		forward: ref(false),
		backward: ref(false),
		left: ref(false),
		right: ref(false),
		run: ref(false),
		jump: ref(false),
	};
}

class InputDataHandler {
	public readonly _playerInputData = _createInputData();
	// public useWASDkeys = true;
	// public useArrowkeys = true;

	callback(eventType: 'keydown' | 'keyup') {
		return this._callbackByEventType[eventType];
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
		// if (isBooleanTrue(this.useWASDkeys)) {
		const wasdKeyCallback = this._eventByWASNKeyOnKeydown[keyCode as keyof WASDEvents];
		if (wasdKeyCallback) {
			return wasdKeyCallback;
		}
		// }
		// if (isBooleanTrue(this.useArrowkeys)) {
		const arrowKeyCallback = this._eventByArrowKeyOnKeydown[keyCode as keyof ArrowEvents];
		if (arrowKeyCallback) {
			return arrowKeyCallback;
		}
		// }
	}
	private _onKeyupCallback(keyCode: string): EventFunction | undefined {
		const jumpRunKeyCallback = this._runJumpEventByKeyOnkeyup[keyCode as keyof JumpRunEvents];
		if (jumpRunKeyCallback) {
			return jumpRunKeyCallback;
		}
		// if (isBooleanTrue(this.useWASDkeys)) {
		const wasdKeyCallback = this._eventByWASNKeyOnKeyup[keyCode as keyof WASDEvents];
		if (wasdKeyCallback) {
			return wasdKeyCallback;
		}
		// }
		// if (isBooleanTrue(this.useArrowkeys)) {
		const arrowKeyCallback = this._eventByArrowKeyOnKeyup[keyCode as keyof ArrowEvents];
		if (arrowKeyCallback) {
			return arrowKeyCallback;
		}
		// }
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
		this._playerInputData.forward.value = true;
	}
	private _onBackwardStart() {
		this._playerInputData.backward.value = true;
	}
	private _onLeftStart() {
		this._playerInputData.left.value = true;
	}
	private _onRightStart() {
		this._playerInputData.right.value = true;
	}
	private _onJumpStart() {
		this._playerInputData.jump.value = true;
	}
	private _onRunStart() {
		this._playerInputData.run.value = true;
	}
	private _onForwardEnd() {
		this._playerInputData.forward.value = false;
	}
	private _onBackwardEnd() {
		this._playerInputData.backward.value = false;
	}
	private _onLeftEnd() {
		this._playerInputData.left.value = false;
	}
	private _onRightEnd() {
		this._playerInputData.right.value = false;
	}
	private _onJumpEnd() {
		this._playerInputData.jump.value = false;
	}
	private _onRunEnd() {
		this._playerInputData.run.value = false;
	}
}

const _inputDataByObject3D: WeakMap<Object3D, InputDataHandler> = new WeakMap();

function _findOrCreateHandler(object3D: Object3D): InputDataHandler {
	let inputData = _inputDataByObject3D.get(object3D);
	if (inputData) {
		return inputData;
	}
	inputData = new InputDataHandler();
	_inputDataByObject3D.set(object3D, inputData);
	return inputData;
}
// interface OnPlayerEventOptions {
// 	// stopPropagation: boolean;
// 	// useWASDkeys: boolean;
// 	// useArrowkeys: boolean;
// }
// export interface OnPlayerEventOptionsString {
// 	// stopPropagation: string;
// 	// useWASDkeys: string;
// 	// useArrowkeys: string;
// }

export class setPlayerInput extends ObjectNamedFunction0 {
	static override type() {
		return 'setPlayerInput';
	}
	func(object3D: Object3D): void {
		// const {stopPropagation, useWASDkeys, useArrowkeys} = options;
		const events = this.scene.eventsDispatcher.keyboardEventsController.currentEvents();
		if (events.length == 0) {
			return;
		}

		// console.log(
		// 	events.map((e) => e.type),
		// 	events.map((e) => e.code)
		// );
		const handler = _findOrCreateHandler(object3D);
		// handler.useWASDkeys = useWASDkeys;
		// handler.useArrowkeys = useArrowkeys;
		for (let event of events) {
			if (event.ctrlKey) {
				// if ctrl is pressed, we do not register any event.
				// this is mostly to allow Ctrl+S to work without triggering a player movement
				return;
			}
			const callbackMethod = handler.callback(event.type as 'keydown' | 'keyup');
			if (!callbackMethod) {
				return;
			}
			const callback = callbackMethod(event.code);
			if (callback) {
				callback();
				// if (isBooleanTrue(stopPropagation)) {
				// 	event.stopImmediatePropagation();
				// 	event.stopPropagation();
				// 	event.preventDefault();
				// }
			}
		}
	}
}

export class getPlayerInputDataLeft extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataLeft';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.left.value;
	}
}
export class getPlayerInputDataRight extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataRight';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.right.value;
	}
}
export class getPlayerInputDataForward extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataForward';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.forward.value;
	}
}
export class getPlayerInputDataBackward extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataBackward';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.backward.value;
	}
}
export class getPlayerInputDataRun extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataRun';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.run.value;
	}
}
export class getPlayerInputDataJump extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerInputDataJump';
	}
	func(object3D: Object3D): boolean {
		return _findOrCreateHandler(object3D)._playerInputData.jump.value;
	}
}
