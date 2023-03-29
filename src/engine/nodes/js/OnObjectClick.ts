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
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

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
	) {
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

		const methodName = this.type();
		//
		const wrappedLines: string = `${methodName}(){
			if( !${bodyLine} ){
				return
			}
			${bodyLines.join('\n')}
		}`;
		return {methodNames: [methodName], wrappedLines};
	}
}
