/**
 * creates a Euler from a Quaternion
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Euler} from 'three';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class EulerFromQuaternionJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new EulerFromQuaternionJsParamsConfig();
export class EulerFromQuaternionJsNode extends TypedJsNode<EulerFromQuaternionJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'eulerFromQuaternion';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.QUATERNION,
				JsConnectionPointType.QUATERNION,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.EULER, JsConnectionPointType.EULER),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const quaternion = this.variableForInput(linesController, JsConnectionPointType.QUATERNION);
		const varName = this.jsVarName(JsConnectionPointType.EULER);
		const tmpVarName = linesController.addVariable(this, new Euler());

		const func = Poly.namedFunctionsRegister.getFunction('eulerSetFromQuaternion', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(quaternion, tmpVarName),
			},
		]);
	}
}
