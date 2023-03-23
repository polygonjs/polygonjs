/**
 * sends a trigger when a keyboard key is pressed
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
// import {CoreString} from '../../../core/String';
// import {isBooleanTrue} from '../../../core/Type';
// import {ParamType} from '../../poly/ParamType';

class BaseOnKeyEventJsParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new BaseOnKeyEventJsParamsConfig();

export abstract class BaseOnKeyEventJsNode extends BaseUserInputJsNode<BaseOnKeyEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['element']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override eventEmitter(): CoreEventEmitter {
		return EVENT_EMITTERS[this.pv.element];
	}

	// public override receiveTrigger(context: ActorNodeTriggerContext) {
	// 	const events = this.scene().eventsDispatcher.keyboardEventsController.currentEvents();
	// 	if (events.length == 0) {
	// 		return;
	// 	}

	// 	const eventMatchesAtLeastOneModifier = () => {
	// 		const ctrlKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.ctrlKey, context);
	// 		for (let event of events) {
	// 			if (event.ctrlKey == isBooleanTrue(ctrlKey)) {
	// 				return true;
	// 			}
	// 		}
	// 		const altKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.altKey, context);
	// 		for (let event of events) {
	// 			if (event.altKey == isBooleanTrue(altKey)) {
	// 				return true;
	// 			}
	// 		}

	// 		const shiftKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.shiftKey, context);
	// 		for (let event of events) {
	// 			if (event.shiftKey == isBooleanTrue(shiftKey)) {
	// 				return true;
	// 			}
	// 		}

	// 		const metaKey = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.metaKey, context);
	// 		for (let event of events) {
	// 			if (event.metaKey == isBooleanTrue(metaKey)) {
	// 				return true;
	// 			}
	// 		}
	// 	};
	// 	const eventMatchesAtLeastOneKeyCode = () => {
	// 		const keyCodes = this._inputValueFromParam<ParamType.STRING>(this.p.keyCodes, context);
	// 		for (let event of events) {
	// 			if (CoreString.matchMask(event.code, keyCodes)) {
	// 				return true;
	// 			}
	// 		}
	// 	};
	// 	if (!eventMatchesAtLeastOneModifier()) {
	// 		return;
	// 	}
	// 	if (!eventMatchesAtLeastOneKeyCode()) {
	// 		return;
	// 	}
	// 	this.runTrigger(context);
	// }
}
