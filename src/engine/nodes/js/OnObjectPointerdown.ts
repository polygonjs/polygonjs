/**
 * sends a trigger when the viewer taps or clicks on an object
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, WrappedBodyLines} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {BaseOnObjectPointerEventJsNode, setLinesWithHoverCheck} from './_BaseOnObjectPointerEvent';
import {PointerEventType} from '../../../core/event/PointerEventType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectPointerdownJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_POINTERDOWN;
	}
	// methodName(): EvaluatorMethodName {
	// 	return JsType.ON_OBJECT_POINTERDOWN;
	// }
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointerdown,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_POINTERDOWN,
			// methodName: this.methodName(),
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
	// private _intersectionByObject: WeakMap<Object3D, Intersection[]> = new Map();
	// public override receiveTrigger(context: JsNodeTriggerContext) {
	// 	const {Object3D} = context;

	// 	const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
	// 	const raycaster = pointerEventsController.raycaster();
	// 	pointerEventsController.updateRaycast(this.pv);

	// 	let intersections = this._intersectionByObject.get(Object3D);
	// 	if (!intersections) {
	// 		intersections = [];
	// 		this._intersectionByObject.set(Object3D, intersections);
	// 	}
	// 	intersections.length = 0;
	// 	raycaster.value.intersectObject(Object3D, isBooleanTrue(this.pv.traverseChildren), intersections);
	// 	this._intersectionByObject.set(Object3D, intersections);
	// 	if (intersections.length != 0) {
	// 		this.runTrigger(context);
	// 	}
	// }
	// public override outputValue(
	// 	context: JsNodeTriggerContext,
	// 	outputName: string
	// ): ReturnValueTypeByJsConnectionPointType[JsConnectionPointType] | undefined {
	// 	const {Object3D} = context;
	// 	switch (outputName) {
	// 		case JsConnectionPointType.INTERSECTION: {
	// 			const intersections = this._intersectionByObject.get(Object3D);
	// 			if (!intersections) {
	// 				return;
	// 			}
	// 			const intersection = intersections[0];
	// 			if (!intersection) {
	// 				return;
	// 			}
	// 			return intersection as ReturnValueTypeByJsConnectionPointType[JsConnectionPointType.INTERSECTION];
	// 		}
	// 	}
	// }
}
