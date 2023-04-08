/**
 * sends a trigger when the viewer taps or clicks anywhere
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnPointerupJsParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
}
const ParamsConfig = new OnPointerupJsParamsConfig();

export class OnPointerupJsNode extends BaseUserInputJsNode<OnPointerupJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_POINTERUP;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointerup,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_POINTERUP,
		};
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}
	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: true,
		});
	}
}
