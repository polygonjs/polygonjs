/**
 * sends triggers on keypress/keydown for WASD, space and shift keys
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
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class BaseOnKeyEventActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
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
		this.io.connection_points.spare_params.setInputlessParamNames(['element']);
		this.io.outputs.setNamedOutputConnectionPoints([
			// new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			...CORE_PLAYER_INPUTS.map(
				(inputName) => new ActorConnectionPoint(inputName, ActorConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);
	}
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const event = this.scene().eventsDispatcher.keyboardEventsController.currentEvent();
		if (!event) {
			return;
		}
		if (event.ctrlKey) {
			// if ctrl is pressed, we do not register any event.
			// this is mostly to allow Ctrl+S to work without triggering a player movement
			return;
		}
		switch (event.type) {
			case 'keydown': {
				return this._onKeydown(event);
			}
			case 'keyup': {
				return this._onKeyup(event);
			}
		}
	}
	public override outputValue(context: ActorNodeTriggerContext, outputName: CorePlayerInput) {
		return this._playerInputData[outputName];
	}

	private _onKeydown(e: KeyboardEvent) {
		switch (e.code) {
			case 'ArrowUp':
			case 'KeyW':
				this._playerInputData.forward = true;
				this._playerInputData.backward = false;
				break;
			case 'ArrowDown':
			case 'KeyS':
				this._playerInputData.backward = true;
				this._playerInputData.forward = false;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this._playerInputData.right = true;
				this._playerInputData.left = false;
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this._playerInputData.left = true;
				this._playerInputData.right = false;
				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				this._playerInputData.run = true;
				break;
			case 'Space':
				this._playerInputData.jump = true;
				break;
		}
	}
	private _onKeyup(e: KeyboardEvent) {
		switch (e.code) {
			case 'ArrowUp':
			case 'KeyW':
				this._playerInputData.forward = false;
				break;
			case 'ArrowDown':
			case 'KeyS':
				this._playerInputData.backward = false;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this._playerInputData.right = false;
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this._playerInputData.left = false;
				break;
			case 'ShiftLeft':
			case 'ShiftRight':
				this._playerInputData.run = false;
				break;
			case 'Space':
				this._playerInputData.jump = false;
				break;
		}
	}
}
