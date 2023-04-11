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
import {RefJsDefinition} from './utils/JsDefinition';

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

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(OnObjectHoverJsNodeOutputName.hovered)) {
			this._addHoveredRef(shadersCollectionController);
		}
		if (usedOutputNames.includes(JsConnectionPointType.INTERSECTION)) {
			this._addIntersectionRef(shadersCollectionController);
		}
	}

	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const traverseChildren = this.variableForInputParam(shadersCollectionController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(shadersCollectionController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(shadersCollectionController, this.p.pointsThreshold);

		const newHovered = `newHovered`;
		const currentHovered = `currentHovered`;

		const outIntersection = this._addIntersectionRef(shadersCollectionController);
		const outHovered = this._addHoveredRef(shadersCollectionController);

		// const _getObjectHoveredIntersection_ = () => {
		// 	const func = Poly.namedFunctionsRegister.getFunction(
		// 		'getObjectHoveredIntersection',
		// 		this,
		// 		shadersCollectionController
		// 	);
		// 	return func.asString(object3D);
		// };

		const _getObjectHoveredState_ = () => {
			const func = Poly.namedFunctionsRegister.getFunction(
				'getObjectHoveredState',
				this,
				shadersCollectionController
			);
			return func.asString(object3D, traverseChildren, lineThreshold, pointsThreshold, `this.${outIntersection}`);
		};

		//
		// const _getObjectHoveredIntersection = _getObjectHoveredIntersection_();
		const _getObjectHoveredState = _getObjectHoveredState_();

		//
		const bodyLines = [
			`const ${newHovered} = ${_getObjectHoveredState};`,
			`const ${currentHovered} = this.${outHovered}.value;`,
			`this.${outHovered}.value = ${newHovered};`,
			`if( ${newHovered} != ${currentHovered} ){`,
			`${triggeredMethods}`,
			`}`,
		];

		// const usedOutputNames = this.io.outputs.used_output_names();
		// if (usedOutputNames.includes(JsConnectionPointType.INTERSECTION)) {

		// 	bodyLines.push(`this.${outIntersection}.value = ${_getObjectHoveredIntersection};`);
		// }

		shadersCollectionController.addTriggeringLines(this, bodyLines, {
			gatherable: true,
			triggeringMethodName: 'onPointermove',
		});
	}
	private _addIntersectionRef(shadersCollectionController: ShadersCollectionController) {
		const outIntersection = this.jsVarName(JsConnectionPointType.INTERSECTION);
		shadersCollectionController.addDefinitions(this, [
			new RefJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.INTERSECTION,
				outIntersection,
				`null`
			),
		]);
		return outIntersection;
	}
	private _addHoveredRef(shadersCollectionController: ShadersCollectionController) {
		const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);
		shadersCollectionController.addDefinitions(this, [
			new RefJsDefinition(this, shadersCollectionController, JsConnectionPointType.BOOLEAN, outHovered, `false`),
		]);
		return outHovered;
	}
}
