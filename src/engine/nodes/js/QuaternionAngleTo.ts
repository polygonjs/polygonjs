/**
 * gets the angle between 2 quaternions
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
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum QuaternionAngleToInputName {
	q1 = 'q1',
	q2 = 'q2',
}
enum QuaternionAngleToOutputName {
	angle = 'angle',
}

class QuaternionAngleToJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new QuaternionAngleToJsParamsConfig();
export class QuaternionAngleToJsNode extends TypedJsNode<QuaternionAngleToJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'quaternionAngleTo';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(QuaternionAngleToInputName.q1, JsConnectionPointType.QUATERNION, CONNECTION_OPTIONS),
			new JsConnectionPoint(QuaternionAngleToInputName.q2, JsConnectionPointType.QUATERNION, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(QuaternionAngleToOutputName.angle, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const q1 = this.variableForInput(linesController, QuaternionAngleToInputName.q1);
		const q2 = this.variableForInput(linesController, QuaternionAngleToInputName.q2);
		const varName = this.jsVarName(QuaternionAngleToOutputName.angle);

		const func = Poly.namedFunctionsRegister.getFunction('quaternionAngleTo', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(q1, q2),
			},
		]);
	}
}
