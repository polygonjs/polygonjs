/**
 * sends a trigger when an object is clicked
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, WrappedBodyLines} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {BaseOnObjectPointerEventJsNode, setLinesWithHoverCheck} from './_BaseOnObjectPointerEvent';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {PointerEventType} from '../../../core/event/PointerEventType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectClickJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_CLICK;
	}
	// methodName(): EvaluatorMethodName {
	// 	return JsType.ON_OBJECT_CLICK;
	// }
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.click,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_CLICK,
			// methodName: this.methodName(),
		};
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);
		// this.io.connection_points.spare_params.setInputlessParamNames([
		// 	'traverseChildren',
		// 	'pointsThreshold',
		// 	'lineThreshold',
		// ]);
	}
	override wrappedBodyLines(
		shadersCollectionController: ShadersCollectionController,
		bodyLines: string[],
		existingMethodNames: Set<string>
	): WrappedBodyLines {
		return setLinesWithHoverCheck(this, shadersCollectionController, bodyLines);
	}
}
