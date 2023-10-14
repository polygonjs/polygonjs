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
	BaseOnObjectPointerEventJsParamsConfig,
} from './_BaseOnObjectPointerEvent';
import {PointerEventType} from '../../../core/event/PointerEventType';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {RefJsDefinition} from './utils/JsDefinition';
import {ParamConfig} from '../utils/params/ParamsConfig';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class OnObjectLongPressJsParamsConfig extends BaseOnObjectPointerEventJsParamsConfig {
	/** @param press duration (in milliseconds) */
	duration = ParamConfig.INTEGER(500, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new OnObjectLongPressJsParamsConfig();

export class OnObjectLongPressJsNode extends ExtendableOnObjectPointerEventJsNode<OnObjectLongPressJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_OBJECT_LONG_PRESS;
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
	protected override _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [new JsConnectionPoint('duration', JsConnectionPointType.INT, CONNECTION_OPTIONS)];
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
		const duration = this.variableForInputParam(linesController, this.p.duration);
		const outIntersection = this._addIntersectionRef(linesController);
		const timerPerObject = this._addTimerPerObjectRef(linesController);
		const timerForCurrentObject = `this.${timerPerObject}[${object3D}.uuid]`;
		const wrappedTriggeredMethodName = `wrappedTriggeredMethod`;
		const onPointerUp = `onPointerUp`;

		const func = Poly.namedFunctionsRegister.getFunction('getObjectHoveredState', this, linesController);
		const bodyLine = func.asString(
			object3D,
			traverseChildren,
			lineThreshold,
			pointsThreshold,
			`this.${outIntersection}`
		);

		//
		const bodyLines = [
			`if( ${bodyLine} ){`,
			`if (!${timerForCurrentObject}) {
				// execute the triggered method after the duration
				const ${wrappedTriggeredMethodName} = () => {
					delete ${timerForCurrentObject};
					if( ${bodyLine} ){
						${triggeredMethods};
					}
				}
				// cancel the triggered method if the pointer is released before the duration
				const ${onPointerUp} = ()=>{
					document.removeEventListener('pointerup', ${onPointerUp});
					if (${timerForCurrentObject}) {
						clearTimeout(${timerForCurrentObject});
						delete ${timerForCurrentObject};
					}
				}
				document.addEventListener('pointerup', ${onPointerUp});

				${timerForCurrentObject} = setTimeout(${wrappedTriggeredMethodName}, ${duration});
			}`,
			`}`,
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
	private _addTimerPerObjectRef(linesController: JsLinesCollectionController) {
		const outTimerPerObject = this.jsVarName('timerPerObject');
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.INT, outTimerPerObject, `{}`),
		]);
		return outTimerPerObject;
	}
}
