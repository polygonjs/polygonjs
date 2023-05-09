/**
 * creates a Quaternion
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Quaternion} from 'three';
import {Poly} from '../../Poly';

class QuaternionJsParamsConfig extends NodeParamsConfig {
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param rotation order */
	angle = ParamConfig.FLOAT(0, {
		range: [-Math.PI, Math.PI],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new QuaternionJsParamsConfig();
export class QuaternionJsNode extends TypedJsNode<QuaternionJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'quaternion';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.QUATERNION, JsConnectionPointType.QUATERNION),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const axis = this.variableForInputParam(linesController, this.p.axis);
		const angle = this.variableForInputParam(linesController, this.p.angle);
		const varName = this.jsVarName(JsConnectionPointType.QUATERNION);
		const tmpVarName = linesController.addVariable(this, new Quaternion());

		const func = Poly.namedFunctionsRegister.getFunction('quaternionSetFromAxisAngle', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(axis, angle, tmpVarName),
			},
		]);
	}
}
