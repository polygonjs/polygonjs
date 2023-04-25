/**
 * slerps a quaternion to another quaternion
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {Quaternion} from 'three';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum QuaternionSlerpInputName {
	q1 = 'q1',
	q2 = 'q2',
	lerp = 'lerp',
}

class QuaternionSlerpJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new QuaternionSlerpJsParamsConfig();
export class QuaternionSlerpJsNode extends TypedJsNode<QuaternionSlerpJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'quaternionSlerp';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(QuaternionSlerpInputName.q1, JsConnectionPointType.QUATERNION, CONNECTION_OPTIONS),
			new JsConnectionPoint(QuaternionSlerpInputName.q2, JsConnectionPointType.QUATERNION, CONNECTION_OPTIONS),
			new JsConnectionPoint(QuaternionSlerpInputName.lerp, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.QUATERNION, JsConnectionPointType.QUATERNION),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const q1 = this.variableForInput(linesController, QuaternionSlerpInputName.q1);
		const q2 = this.variableForInput(linesController, QuaternionSlerpInputName.q2);
		const lerp = this.variableForInput(linesController, QuaternionSlerpInputName.lerp);
		const varName = this.jsVarName(JsConnectionPointType.QUATERNION);
		const tmpVarName = linesController.addVariable(this, new Quaternion());

		const func = Poly.namedFunctionsRegister.getFunction('quaternionSlerp', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(q1, q2, lerp, tmpVarName),
			},
		]);
	}
}
