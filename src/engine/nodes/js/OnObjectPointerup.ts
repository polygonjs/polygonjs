/**
 * sends a trigger when the viewer taps or clicks on an object
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, WrappedBodyLines} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseOnObjectPointerEventJsNode, setLinesWithHoverCheck} from './_BaseOnObjectPointerEvent';
import {PointerEventType} from '../../../core/event/PointerEventType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectPointerupJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_POINTERUP;
	}

	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointerup,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_POINTERUP,
		};
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold', 'element']);
	}
	override wrappedBodyLines(
		shadersCollectionController: ShadersCollectionController,
		bodyLines: string[],
		existingMethodNames: Set<string>
	): WrappedBodyLines {
		return setLinesWithHoverCheck(this, shadersCollectionController, bodyLines);
	}
}
