/**
 * sends a trigger when an object is clicked
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {
	BaseOnObjectPointerGPUEventJsNode,
	OnObjectPointerEventGPUJsNodeInputName,
	OnObjectPointerEventGPUJsNodeOutputName,
} from './_BaseOnObjectPointerEvent';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {ObjectToClickOptionsAsString} from '../../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsClickController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectClickGPUJsNode extends BaseOnObjectPointerGPUEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_CLICK_GPU;
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
			new JsConnectionPoint(
				OnObjectPointerEventGPUJsNodeInputName.worldPosMaterial,
				JsConnectionPointType.MATERIAL,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				OnObjectPointerEventGPUJsNodeOutputName.distance,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(OnObjectPointerEventGPUJsNodeOutputName.distance)) {
			this._addDistanceRef(linesController);
		}
	}

	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, linesController);
		const blockObjectsBehind = this.variableForInputParam(linesController, this.p.blockObjectsBehind);
		const skipIfObjectsInFront = this.variableForInputParam(linesController, this.p.skipIfObjectsInFront);
		const worldPosMaterial = this.variableForInput(
			linesController,
			OnObjectPointerEventGPUJsNodeInputName.worldPosMaterial
		);
		const distanceRef = this._addDistanceRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToClickCheck', this, linesController);
		const options: ObjectToClickOptionsAsString = {
			priority: {
				blockObjectsBehind,
				skipIfObjectsInFront,
			},
			gpu: {
				worldPosMaterial,
				distanceRef: `this.${distanceRef}`,
			},
			click: {
				callback: `this.${nodeMethodName(this)}.bind(this)`,
			},
		};
		const jsonOptions = JSON.stringify(options).replace(/"/g, '');
		const bodyLine = func.asString(object3D, `this`, jsonOptions);
		linesController.addDefinitions(this, [
			new InitFunctionJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D, this.path(), bodyLine),
		]);

		linesController.addTriggeringLines(this, [triggeredMethods], {gatherable: true});
	}

	private _addDistanceRef(linesController: JsLinesCollectionController) {
		const outDistance = this.jsVarName(OnObjectPointerEventGPUJsNodeOutputName.distance);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.FLOAT, outDistance, `-1`),
		]);
		return outDistance;
	}
}
