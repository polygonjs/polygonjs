/**
 * gets the 2D position of the cursor
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
import {ComputedValueJsDefinition} from './utils/JsDefinition';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {Poly} from '../../Poly';
import {PointerEventType} from '../../../core/event/PointerEventType';

const OUTPUT_NAME = 'cursor';
class CursorJsParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
	});
	/** @param cursor */
	// cursor = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CursorJsParamsConfig();
export class CursorJsNode extends BaseUserInputJsNode<CursorJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): JsType.CURSOR {
		return JsType.CURSOR;
	}
	// userInputEventNames() {
	// 	return ['pointermove'];
	// }

	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointermove,
			emitter: this.eventEmitter(),
			jsType: JsType.CURSOR,
		};
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
	setEventEmitter(emitter: CoreEventEmitter) {
		this.p.element.set(EVENT_EMITTERS.indexOf(emitter));
	}
	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['element']);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR2),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const out = this.jsVarName(OUTPUT_NAME);

		const _cursor = Poly.namedFunctionsRegister.getFunction('globalsCursor', this, shadersCollectionController);
		shadersCollectionController.addDefinitions(this, [
			new ComputedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.VECTOR2,
				out,
				_cursor.asString()
			),
		]);
	}
}
