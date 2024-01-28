/**
 * transforms a vector3 by a matrix4
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {Vector3} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class Vector3ApplyMatrix4JsParamsConfig extends NodeParamsConfig {
	/** @param Vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3ApplyMatrix4JsParamsConfig();
export class Vector3ApplyMatrix4JsNode extends TypedJsNode<Vector3ApplyMatrix4JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3ApplyMatrix4';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATRIX4, JsConnectionPointType.MATRIX4, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const vector3 = this.variableForInputParam(linesController, this.p.Vector3);
		const matrix4 = this.variableForInput(linesController, JsConnectionPointType.MATRIX4);
		const varName = this.jsVarName(JsConnectionPointType.VECTOR3);
		const tmpVarName = linesController.addVariable(this, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('vector3ApplyMatrix4', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATRIX4,
				varName,
				value: func.asString(vector3, matrix4, tmpVarName),
			},
		]);
	}
}
