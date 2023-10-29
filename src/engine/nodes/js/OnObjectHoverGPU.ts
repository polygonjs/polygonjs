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
import {BaseOnObjectPointerGPUEventJsNode} from './_BaseOnObjectPointerEvent';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {InitFunctionJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {AddObjectToHoverOptionsAsString} from '../../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum OnObjectHoverGPUJsNodeInputName {
	worldPosMaterial = 'worldPosMaterial',
}
enum OnObjectHoverGPUJsNodeOutputName {
	hovered = 'hovered',
	distance = 'distance',
}
export class OnObjectHoverGPUJsNode extends BaseOnObjectPointerGPUEventJsNode {
	static override type() {
		return JsType.ON_OBJECT_HOVER_GPU;
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
			new JsConnectionPoint(
				OnObjectHoverGPUJsNodeInputName.worldPosMaterial,
				JsConnectionPointType.MATERIAL,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				OnObjectHoverGPUJsNodeOutputName.hovered,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				OnObjectHoverGPUJsNodeOutputName.distance,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(OnObjectHoverGPUJsNodeOutputName.hovered)) {
			this._addHoveredRef(linesController);
		}
		if (usedOutputNames.includes(OnObjectHoverGPUJsNodeOutputName.distance)) {
			this._addDistanceRef(linesController);
		}
	}
	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, linesController);
		const blockObjectsBehind = this.variableForInputParam(linesController, this.p.blockObjectsBehind);
		const skipIfObjectsInFront = this.variableForInputParam(linesController, this.p.skipIfObjectsInFront);
		const worldPosMaterial = this.variableForInput(
			linesController,
			OnObjectHoverGPUJsNodeInputName.worldPosMaterial
		);
		const distanceRef = this._addDistanceRef(linesController);
		const hoveredStateRef = this._addHoveredRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToHoveredCheck', this, linesController);
		const options: AddObjectToHoverOptionsAsString = {
			priority: {
				blockObjectsBehind,
				skipIfObjectsInFront,
			},
			gpu: {
				worldPosMaterial,
				distanceRef: `this.${distanceRef}`,
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

	private _addDistanceRef(linesController: JsLinesCollectionController) {
		const outDistance = this.jsVarName(OnObjectHoverGPUJsNodeOutputName.distance);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.FLOAT, outDistance, `-1`),
		]);
		return outDistance;
	}

	private _addHoveredRef(linesController: JsLinesCollectionController) {
		const outHovered = this.jsVarName(OnObjectHoverGPUJsNodeOutputName.hovered);
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.BOOLEAN, outHovered, `false`),
		]);
		return outHovered;
	}
}
