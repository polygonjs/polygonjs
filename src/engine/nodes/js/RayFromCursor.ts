/**
 * gets the ray from the cursor
 *
 * @remarks
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseUserInputJsNode} from './_BaseUserInput';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {ComputedValueJsDefinition} from './utils/JsDefinition';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {Poly} from '../../Poly';
import {PointerEventType} from '../../../core/event/PointerEventType';

const OUTPUT_NAME = JsConnectionPointType.RAY;
class RayFromCursorJsParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
	});
}
const ParamsConfig = new RayFromCursorJsParamsConfig();
export class RayFromCursorJsNode extends BaseUserInputJsNode<RayFromCursorJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.RAY_FROM_CURSOR;
	}
	// userInputEventNames() {
	// 	return ['pointermove'];
	// }
	override eventData(): EvaluatorEventData[] | undefined {
		return [
			{
				type: PointerEventType.pointermove,
				emitter: this.eventEmitter(),
				jsType: JsType.RAY_FROM_CURSOR,
			},
			{
				type: PointerEventType.touchmove,
				emitter: this.eventEmitter(),
				jsType: JsType.RAY_FROM_CURSOR,
			},
		];
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
	setEventEmitter(emitter: CoreEventEmitter) {
		this.p.element.set(EVENT_EMITTERS.indexOf(emitter));
	}
	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['element']);
		this.io.outputs.setNamedOutputConnectionPoints([new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.RAY)]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const out = this.jsVarName(OUTPUT_NAME);

		const _ray = Poly.namedFunctionsRegister.getFunction('globalsRayFromCursor', this, shadersCollectionController);
		shadersCollectionController.addDefinitions(this, [
			new ComputedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.VECTOR2,
				out,
				_ray.asString()
			),
		]);
	}
}
