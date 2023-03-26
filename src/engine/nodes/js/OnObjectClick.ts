/**
 * sends a trigger when an object is clicked
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {BaseOnObjectPointerEventJsNode} from './_BaseOnObjectPointerEvent';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {getObjectHoveredState} from './js/event';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectClickJsNode extends BaseOnObjectPointerEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_CLICK;
	}
	override eventData(): EvaluatorEventData | undefined {
		return {
			type: 'pointerdown',
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_CLICK,
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
		this.io.connection_points.spare_params.setInputlessParamNames([
			'traverseChildren',
			'pointsThreshold',
			'lineThreshold',
		]);
	}
	override wrappedBodyLines(
		shadersCollectionController: ShadersCollectionController,
		bodyLines: string[],
		existingMethodNames: Set<string>
	) {
		const traverseChildren = this.variableForInputParam(shadersCollectionController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(shadersCollectionController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(shadersCollectionController, this.p.pointsThreshold);
		const func = new getObjectHoveredState(this, shadersCollectionController);
		const bodyLine = func.asString(traverseChildren, lineThreshold, pointsThreshold);

		const methodName = this.type();
		//
		const wrappedLines: string = `${methodName}(){
			if( !${bodyLine} ){
				return
			}
			${bodyLines.join('\n')}
		}`;
		return {methodNames: [methodName], wrappedLines};

		// 	// const hoverWrappedLinesData = this.onObjectHoverWrappedLines(shadersCollectionController, []);
		// 	const traverseChildren = this.variableForInputParam(shadersCollectionController, this.p.traverseChildren);
		// 	const lineThreshold = this.variableForInputParam(shadersCollectionController, this.p.lineThreshold);
		// 	const pointsThreshold = this.variableForInputParam(shadersCollectionController, this.p.pointsThreshold);
		// 	const func = new getObjectHoveredState(this, shadersCollectionController);
		// 	const bodyLine = func.asString(traverseChildren, lineThreshold, pointsThreshold);

		// 	const outHovered = this.jsVarName(OnObjectHoverJsNodeOutputName.hovered);
		// 	const methodName = this.type();
		// 	const wrappedLinesOnClick = `
		// 	${methodName}(){
		// 		if( !this.${outHovered}.value ){
		// 			return
		// 		}
		// 		${bodyLines.join('\n')}
		// 	}`;

		// 	if (existingMethodNames.has(hoverWrappedLinesData.methodName)) {
		// 		return {
		// 			methodNames: [methodName],
		// 			wrappedLines: wrappedLinesOnClick,
		// 		};
		// 	} else {
		// 		return {
		// 			methodNames: [hoverWrappedLinesData.methodName, methodName],
		// 			wrappedLines: `${hoverWrappedLinesData.wrappedLines}
		// ${wrappedLinesOnClick}`,
		// 		};
		// 	}
	}
}
