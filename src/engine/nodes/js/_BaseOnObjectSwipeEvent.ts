/**
 * sends a trigger when the viewer swipes down on an object
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {BaseOnObjectPointerEventJsNode} from './_BaseOnObjectPointerEvent';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {RefJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {Vector2} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export abstract class BaseOnObjectSwipeEventJsNode extends BaseOnObjectPointerEventJsNode {
	override eventData(): EvaluatorEventData[] {
		return [
			{
				type: PointerEventType.touchstart,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_POINTERDOWN,
			},
			{
				type: PointerEventType.touchend,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_POINTERUP,
			},
		];
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

		const _cursorFunc = Poly.namedFunctionsRegister.getFunction('globalsCursor', this, linesController);
		// const varName = `${sanitizedNodePath}_${this.p.position.name()}`;
		const onPointerdownCursor = linesController.addVariable(this, new Vector2());
		const onPointerupCursor = linesController.addVariable(this, new Vector2());

		const func = Poly.namedFunctionsRegister.getFunction('getObjectHoveredState', this, linesController);
		const bodyLine = func.asString(
			object3D,
			traverseChildren,
			lineThreshold,
			pointsThreshold,
			`this.${outIntersection}`
		);
		const swipeStarted = TypedJsNode.inputVarName(this, 'swipeStarted');

		//
		const bodyLinesOnPointerdown = `
if(${bodyLine}){
	console.log('ok A');
	this.${swipeStarted} = true;
	${onPointerdownCursor}.copy( ${_cursorFunc.asString()} );
} else {
	console.log('NOT ok A');
	this.${swipeStarted} = false;
}`;
		const bodyLinesOnPointerup = `
if( ${bodyLine} && this.${swipeStarted} ){
	console.log('ok B');
	this.${swipeStarted} = false;
	${onPointerupCursor}.copy( ${_cursorFunc.asString()} );
	if( ${this._cursorComparison(onPointerdownCursor, onPointerupCursor)} ){
		console.log('ok B 2');
		${triggeredMethods}
	}
}`;

		linesController.addTriggeringLines(this, [bodyLinesOnPointerdown], {
			gatherable: true,
			triggeringMethodName: JsType.ON_POINTERDOWN,
			nodeMethodName: nodeMethodName(this) + 'onPointerdown',
		});
		linesController.addTriggeringLines(this, [bodyLinesOnPointerup], {
			gatherable: true,
			triggeringMethodName: JsType.ON_POINTERUP,
			nodeMethodName: nodeMethodName(this) + 'onPointerup',
		});
	}

	private _addIntersectionRef(linesController: JsLinesCollectionController) {
		const outIntersection = this.jsVarName(JsConnectionPointType.INTERSECTION);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INTERSECTION, outIntersection, `null`),
		]);
		return outIntersection;
	}

	protected abstract _cursorComparison(onPointerdownCursor: string, onPointerupCursor: string): string;
}
