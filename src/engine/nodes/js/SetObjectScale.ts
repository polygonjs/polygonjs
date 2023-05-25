/**
 * Update the object scale
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectScaleJsParamsConfig extends NodeParamsConfig {
	/** @param target scale */
	scale = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param target scale */
	mult = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectScaleJsParamsConfig();

export class SetObjectScaleJsNode extends TypedJsNode<SetObjectScaleJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectScale';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const scale = this.variableForInputParam(linesController, this.p.scale);
		const mult = this.variableForInputParam(linesController, this.p.mult);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(linesController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectScale', this, linesController);
		const bodyLine = func.asString(object3D, scale, mult, lerp, updateMatrix);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
