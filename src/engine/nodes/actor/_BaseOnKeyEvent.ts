/**
 * sends a trigger when a keyboard key is pressed
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
import {CoreString} from '../../../core/String';
import {isBooleanTrue} from '../../../core/Type';
import {ParamType} from '../../poly/ParamType';

class BaseOnKeyEventActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
	/** @param space separated list of accepted key codes. If this is empty then any key is accepted. */
	keyCodes = ParamConfig.STRING('Digit1 KeyE ArrowDown');
	/** @param requires ctrlKey */
	ctrlKey = ParamConfig.BOOLEAN(0);
	/** @param requires altKey */
	altKey = ParamConfig.BOOLEAN(0);
	/** @param requires shiftKey */
	shiftKey = ParamConfig.BOOLEAN(0);
	/** @param requires metaKey */
	metaKey = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new BaseOnKeyEventActorParamsConfig();

export abstract class BaseOnKeyEventActorNode extends BaseUserInputActorNode<BaseOnKeyEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['element']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}
	override eventEmitter(): CoreEventEmitter {
		return EVENT_EMITTERS[this.pv.element];
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const event = this.scene().eventsDispatcher.keyboardEventsController.currentEvent();
		if (!event) {
			return;
		}

		const ctrlKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.ctrlKey, context);
		if (event.ctrlKey != isBooleanTrue(ctrlKey)) {
			return;
		}
		const altKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.altKey, context);
		if (event.altKey != isBooleanTrue(altKey)) {
			return;
		}
		const shiftKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.shiftKey, context);
		if (event.shiftKey != isBooleanTrue(shiftKey)) {
			return;
		}
		const metaKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.metaKey, context);
		if (event.metaKey != isBooleanTrue(metaKey)) {
			return;
		}
		const keyCodes = this._inputValueFromParam<ParamType.STRING>(this.p.keyCodes, context);
		if (!CoreString.matchMask(event.code, keyCodes)) {
			return;
		}
		this.runTrigger(context);
	}
}
