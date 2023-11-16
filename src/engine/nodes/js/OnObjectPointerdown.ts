/**
 * sends a trigger when the viewer taps or clicks on an object
 *
 *
 */

import {TRIGGER_CONNECTION_NAME} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {
	ExtendableOnObjectPointerEventJsNode,
	PointerEventConfigParamConfig,
	CPUOnObjectPointerEventJsParamsConfig,
	pointerButtonConfig,
} from './_BaseOnObjectPointerEvent';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {ObjectToPointerdownOptionsAsString} from '../../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerdownController';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectPointerdownJsParamsConfig extends PointerEventConfigParamConfig(
	CPUOnObjectPointerEventJsParamsConfig
) {}
const ParamsConfig = new OnObjectPointerdownJsParamsConfig();

export class OnObjectPointerdownJsNode extends ExtendableOnObjectPointerEventJsNode<OnObjectPointerdownJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_OBJECT_POINTERDOWN;
	}

	override eventData(): EvaluatorEventData | undefined {
		return {
			type: PointerEventType.pointerdown,
			emitter: this.eventEmitter(),
			jsType: JsType.ON_OBJECT_POINTERDOWN,
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
		const blockObjectsBehind = this.variableForInputParam(linesController, this.p.blockObjectsBehind);
		const skipIfObjectsInFront = this.variableForInputParam(linesController, this.p.skipIfObjectsInFront);
		const traverseChildren = this.variableForInputParam(linesController, this.p.traverseChildren);
		const lineThreshold = this.variableForInputParam(linesController, this.p.lineThreshold);
		const pointsThreshold = this.variableForInputParam(linesController, this.p.pointsThreshold);
		const intersectionRef = this._addIntersectionRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('addObjectToPointerdownCheck', this, linesController);
		const options: ObjectToPointerdownOptionsAsString = {
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
			pointerdown: {
				callback: `this.${nodeMethodName(this)}.bind(this)`,
			},
			config: pointerButtonConfig(this, linesController),
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
