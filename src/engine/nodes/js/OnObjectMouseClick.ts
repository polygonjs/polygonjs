/**
 * sends a trigger when an object is clicked
 *
 * This is similar to js/onObjectClick, except that it support multiple mouse buttons at the same time.
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {
	ExtendableOnObjectPointerEventJsNode,
	CPUOnObjectPointerEventJsParamsConfig,
	MouseEventConfigParamConfig,
	mouseButtonsConfig,
} from './_BaseOnObjectPointerEvent';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {MouseEventType} from '../../../core/event/MouseEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {
	ObjectToClickOptionsAsString,
	ClickParamConfig,
} from '../../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsClickController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectMouseClickJsParamsConfig extends MouseEventConfigParamConfig(
	ClickParamConfig(CPUOnObjectPointerEventJsParamsConfig)
) {}
const ParamsConfig = new OnObjectMouseClickJsParamsConfig();

export class OnObjectMouseClickJsNode extends ExtendableOnObjectPointerEventJsNode<OnObjectMouseClickJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_OBJECT_MOUSE_CLICK;
	}
	override isTriggering() {
		return true;
	}

	override eventData(): EvaluatorEventData[] | undefined {
		// we need both mousedown and mouseup events,
		// to ensure that the raycaster gets its cursor updated
		// on each event
		return [
			{
				type: MouseEventType.mousedown,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_MOUSE_CLICK,
			},
			{
				type: MouseEventType.mouseup,
				emitter: this.eventEmitter(),
				jsType: JsType.ON_OBJECT_MOUSE_CLICK,
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
		const blockObjectsBehind = this.variableForInputParam(linesController, this.p.blockObjectsBehind);
		const skipIfObjectsInFront = this.variableForInputParam(linesController, this.p.skipIfObjectsInFront);
		const traverseChildren = this.variableForInputParam(linesController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(linesController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(linesController, this.p.pointsThreshold);
		const maxCursorMoveDistance = this.variableForInputParam(linesController, this.p.maxCursorMoveDistance);
		const maxDuration = this.variableForInputParam(linesController, this.p.maxDuration);
		const intersectionRef = this._addIntersectionRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToMouseClickCheck', this, linesController);
		const options: ObjectToClickOptionsAsString = {
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
			click: {
				maxCursorMoveDistance,
				maxDuration,
				callback: `this.${nodeMethodName(this)}.bind(this)`,
			},
			config: mouseButtonsConfig(this, linesController),
		};
		const jsonOptions = JSON.stringify(options).replace(/"/g, '');
		const bodyLine = func.asString(object3D, `this`, jsonOptions);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);

		linesController.addTriggeringLines(this, [triggeredMethods], {gatherable: true});
	}

	private _addIntersectionRef(linesController: JsLinesCollectionController) {
		const outIntersection = this.jsVarName(JsConnectionPointType.INTERSECTION);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INTERSECTION, outIntersection, `null`),
		]);
		return outIntersection;
	}
}
