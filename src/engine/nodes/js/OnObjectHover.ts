/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseOnObjectPointerEventJsNode, OnObjectHoverJsNodeOutputName} from './_BaseOnObjectPointerEvent';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {PointerEventType} from '../../../core/event/PointerEventType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectHoverJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_HOVER;
	}
	override isTriggering() {
		return true;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointermove,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_HOVER,
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
				OnObjectHoverJsNodeOutputName.hovered,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				JsConnectionPointType.INTERSECTION,
				JsConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const traverseChildren = this.variableForInputParam(shadersCollectionController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(shadersCollectionController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(shadersCollectionController, this.p.pointsThreshold);
		const func = Poly.namedFunctionsRegister.getFunction(
			'getObjectHoveredState',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, traverseChildren, lineThreshold, pointsThreshold);

		const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);
		this._addHoveredRef(shadersCollectionController);

		const newValue = `newHovered`;
		const currentValue = `currentHovered`;
		//
		const bodyLines = [
			`const ${newValue} = ${bodyLine};`,
			`const ${currentValue} = this.${outHovered}.value;`,
			`this.${outHovered}.value = ${newValue};`,
			`if( ${newValue} != ${currentValue} ){`,
			`${triggeredMethods}`,
			`}`,
		];

		shadersCollectionController.addTriggeringLines(this, bodyLines);
	}
}
