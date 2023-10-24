/**
 * sends a trigger when an object is clicked
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {BaseOnObjectPointerEventJsNode} from './_BaseOnObjectPointerEvent';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {RefJsDefinition} from './utils/JsDefinition';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectClickJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_CLICK;
	}
	override isTriggering() {
		return true;
	}

	override eventData(): EvaluatorEventData[] | undefined {
		// we need both pointerdown and pointerup events,
		// to ensure that the raycaster gets its cursor updated
		// on each event
		return [
			{
				type: PointerEventType.pointerdown,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_POINTERDOWN,
			},
			{
				type: PointerEventType.pointerup,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_POINTERUP,
			},
		];
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
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(JsConnectionPointType.INTERSECTION)) {
			this._addIntersectionRef(linesController);
		}
	}

	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, linesController);
		const traverseChildren = this.variableForInputParam(linesController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(linesController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(linesController, this.p.pointsThreshold);
		const outIntersection = this._addIntersectionRef(linesController);
		const onPointerUp = `onPointerUp`;

		const func = Poly.namedFunctionsRegister.getFunction('getObjectHoveredState', this, linesController);
		const isHovered = func.asString(
			object3D,
			traverseChildren,
			lineThreshold,
			pointsThreshold,
			`this.${outIntersection}`
		);

		//
		const bodyLines = [
			`if( ${isHovered} ){
				const ${onPointerUp} = ()=>{
					document.removeEventListener('pointerup', ${onPointerUp});
					if( ${isHovered} ){
						${triggeredMethods};
					}
				}
				document.addEventListener('pointerup', ${onPointerUp});
			}`,
		];

		linesController.addTriggeringLines(this, bodyLines, {
			gatherable: true,
			triggeringMethodName: JsType.ON_POINTERDOWN,
		});
	}

	private _addIntersectionRef(linesController: JsLinesCollectionController) {
		const outIntersection = this.jsVarName(JsConnectionPointType.INTERSECTION);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INTERSECTION, outIntersection, `null`),
		]);
		return outIntersection;
	}
}
