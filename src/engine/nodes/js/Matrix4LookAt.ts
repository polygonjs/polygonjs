/**
 * gets the angle between 2 quaternions
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {Matrix4} from 'three';

class Matrix4LookAtJsParamsConfig extends NodeParamsConfig {
	/** @param eye */
	eye = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param target */
	target = ParamConfig.VECTOR3([0, 0, 1]);
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new Matrix4LookAtJsParamsConfig();
export class Matrix4LookAtJsNode extends TypedJsNode<Matrix4LookAtJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'matrix4LookAt';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.MATRIX4, JsConnectionPointType.MATRIX4),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const eye = this.variableForInputParam(linesController, this.p.eye);
		const target = this.variableForInputParam(linesController, this.p.target);
		const up = this.variableForInputParam(linesController, this.p.up);
		const varName = this.jsVarName(JsConnectionPointType.MATRIX4);
		const tmpVarName = linesController.addVariable(this, new Matrix4());

		const func = Poly.namedFunctionsRegister.getFunction('matrix4LookAt', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATRIX4,
				varName,
				value: func.asString(eye, target, up, tmpVarName),
			},
		]);
	}
}
