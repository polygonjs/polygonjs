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
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {KeyModifierRequirement, KEY_MODIFIER_REQUIREMENTS} from '../../functions/KeyboardEventMatchesConfig';

const KEY_MENU_ENTRIES = {menu: {entries: KEY_MODIFIER_REQUIREMENTS.map((name, value) => ({name, value}))}};
const OPTIONAL_ENTRY = KEY_MODIFIER_REQUIREMENTS.indexOf(KeyModifierRequirement.OPTIONAL);

class BaseOnKeyEventJsParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
	/** @param space separated list of accepted key codes. If this is empty then any key is accepted. */
	keyCodes = ParamConfig.STRING('Digit1 KeyE ArrowDown');
	/** @param requires ctrlKey */
	ctrlKey = ParamConfig.INTEGER(OPTIONAL_ENTRY, KEY_MENU_ENTRIES);
	/** @param requires altKey */
	altKey = ParamConfig.INTEGER(OPTIONAL_ENTRY, KEY_MENU_ENTRIES);
	/** @param requires shiftKey */
	shiftKey = ParamConfig.INTEGER(OPTIONAL_ENTRY, KEY_MENU_ENTRIES);
	/** @param requires metaKey */
	metaKey = ParamConfig.INTEGER(OPTIONAL_ENTRY, KEY_MENU_ENTRIES);
}
const ParamsConfig = new BaseOnKeyEventJsParamsConfig();

export abstract class BaseOnKeyEventJsNode extends BaseUserInputJsNode<BaseOnKeyEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	override isTriggering() {
		return true;
	}
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
	// abstract methodName(): EvaluatorMethodName;

	override wrappedBodyLines(
		shadersCollectionController: ShadersCollectionController,
		bodyLines: string[],
		existingMethodNames: Set<string>
	) {
		const keyCodes = this.variableForInputParam(shadersCollectionController, this.p.keyCodes);
		const ctrlKey = this.variableForInputParam(shadersCollectionController, this.p.ctrlKey);
		const altKey = this.variableForInputParam(shadersCollectionController, this.p.altKey);
		const shiftKey = this.variableForInputParam(shadersCollectionController, this.p.shiftKey);
		const metaKey = this.variableForInputParam(shadersCollectionController, this.p.metaKey);
		const func = Poly.namedFunctionsRegister.getFunction(
			'keyboardEventMatchesConfig',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(keyCodes, ctrlKey, altKey, shiftKey, metaKey);

		const methodName = this.wrappedBodyLinesMethodName();
		//
		const wrappedLines: string = `${methodName}(){
			if( !${bodyLine} ){
				return
			}
			${bodyLines.join('\n')}
		}`;
		return {methodNames: [methodName], wrappedLines};
	}
}
