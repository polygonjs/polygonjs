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
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {TouchEventType} from '../../../core/event/TouchEventType';
import {isTouchDevice} from '../../../core/UserAgent';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {ObjectToPointerdownOptionsAsString} from '../../scene/utils/actors/rayObjectIntersection/PointerdownController';
import {InitFunctionJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnPointerdownJsParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
}
const ParamsConfig = new OnPointerdownJsParamsConfig();

export class OnPointerdownJsNode extends BaseUserInputJsNode<OnPointerdownJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_POINTERDOWN;
	}
	override eventData(): EvaluatorEventData | undefined {
		if (isTouchDevice()) {
			return {
				type: TouchEventType.touchstart,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_POINTERDOWN,
			};
		} else {
			return {
				type: PointerEventType.pointerdown,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_POINTERDOWN,
			};
		}
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
	setEventEmitter(emitter: CoreEventEmitter) {
		this.p.element.set(EVENT_EMITTERS.indexOf(emitter));
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}
	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToPointerdownCheck', this, linesController);
		const options: ObjectToPointerdownOptionsAsString = {
			pointerdown: {
				callback: `this.${nodeMethodName(this)}.bind(this)`,
			},
		};
		const jsonOptions = JSON.stringify(options).replace(/"/g, '');
		const bodyLine = func.asString(object3D, `this`, jsonOptions);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);

		linesController.addTriggeringLines(this, [triggeredMethods], {gatherable: true});
	}
}
