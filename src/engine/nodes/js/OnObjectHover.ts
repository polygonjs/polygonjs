/**
 * sends a trigger when an object is hovered
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseOnObjectPointerEventJsNode} from './_BaseOnObjectPointerEvent';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {InitFunctionJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {ObjectToHoverOptionsAsString} from '../../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum OnObjectHoverJsNodeOutputName {
	hovered = 'hovered',
}
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

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(OnObjectHoverJsNodeOutputName.hovered)) {
			this._addHoveredRef(linesController);
		}
		if (usedOutputNames.includes(JsConnectionPointType.INTERSECTION)) {
			this._addIntersectionRef(linesController);

			if (!usedOutputNames.includes(JsConnectionPointType.TRIGGER)) {
				this.setTriggeringLines(linesController, '');
			}
		}
	}
	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, linesController);
		const blockObjectsBehind = this.variableForInputParam(linesController, this.p.blockObjectsBehind);
		const skipIfObjectsInFront = this.variableForInputParam(linesController, this.p.skipIfObjectsInFront);
		const traverseChildren = this.variableForInputParam(linesController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(linesController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(linesController, this.p.pointsThreshold);
		const intersectionRef = this._addIntersectionRef(linesController);
		const hoveredStateRef = this._addHoveredRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToHoveredCheck', this, linesController);
		const options: ObjectToHoverOptionsAsString = {
			priority: {
				blockObjectsBehind,
				skipIfObjectsInFront,
			},
			cpu: {
				traverseChildren,
				pointsThreshold,
				lineThreshold,
				intersectionRef: `this.${intersectionRef}`,
			},
			hover: {
				hoveredStateRef: `this.${hoveredStateRef}`,
				onHoveredStateChange: `this.${nodeMethodName(this)}.bind(this)`,
			},
		};
		const jsonOptions = JSON.stringify(options).replace(/"/g, '');
		const bodyLine = func.asString(object3D, `this`, jsonOptions);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);

		linesController.addTriggeringLines(this, [triggeredMethods], {gatherable: true});
	}

	// override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
	// 	const object3D = inputObject3D(this, linesController);
	// 	const traverseChildren = this.variableForInputParam(linesController, this.p.traverseChildren);
	// 	const lineThreshold = this.variableForInputParam(linesController, this.p.lineThreshold);
	// 	const pointsThreshold = this.variableForInputParam(linesController, this.p.pointsThreshold);

	// 	const newHovered = `newHovered`;
	// 	const currentHovered = `currentHovered`;
	// 	const outIntersection = this._addIntersectionRef(linesController);
	// 	const outHovered = this._addHoveredRef(linesController);

	// 	const _getObjectHoveredState_ = () => {
	// 		const func = Poly.namedFunctionsRegister.getFunction('getObjectHoveredState', this, linesController);
	// 		return func.asString(object3D, traverseChildren, lineThreshold, pointsThreshold, `this.${outIntersection}`);
	// 	};

	// 	const _getObjectHoveredState = _getObjectHoveredState_();

	// 	const bodyLines = [
	// 		`const ${newHovered} = ${_getObjectHoveredState};`,
	// 		`const ${currentHovered} = this.${outHovered}.value;`,
	// 		`this.${outHovered}.value = ${newHovered};`,
	// 		`if( ${newHovered} != ${currentHovered} ){`,
	// 		`${triggeredMethods}`,
	// 		`}`,
	// 	];

	// 	linesController.addTriggeringLines(this, bodyLines, {
	// 		gatherable: true,
	// 		triggeringMethodName: 'onPointermove',
	// 	});
	// }
	private _addIntersectionRef(linesController: JsLinesCollectionController) {
		const outIntersection = this.jsVarName(JsConnectionPointType.INTERSECTION);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INTERSECTION, outIntersection, `null`),
		]);
		return outIntersection;
	}
	private _addHoveredRef(linesController: JsLinesCollectionController) {
		const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.BOOLEAN, outHovered, `false`),
		]);
		return outHovered;
	}
}
