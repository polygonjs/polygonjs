/**
 * multiplies 2 matrices
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
import {Matrix4} from 'three';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum Matrix4MultiplyInputName {
	m1 = 'm1',
	m2 = 'm2',
}
class Matrix4MultiplyJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new Matrix4MultiplyJsParamsConfig();
export class Matrix4MultiplyJsNode extends TypedJsNode<Matrix4MultiplyJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'matrix4Multiply';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(Matrix4MultiplyInputName.m1, JsConnectionPointType.MATRIX4, CONNECTION_OPTIONS),
			new JsConnectionPoint(Matrix4MultiplyInputName.m2, JsConnectionPointType.MATRIX4, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.MATRIX4, JsConnectionPointType.MATRIX4),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const m1 = this.variableForInput(linesController, Matrix4MultiplyInputName.m1);
		const m2 = this.variableForInput(linesController, Matrix4MultiplyInputName.m2);
		const varName = this.jsVarName(JsConnectionPointType.MATRIX4);
		const tmpVarName = linesController.addVariable(this, new Matrix4());

		const func = Poly.namedFunctionsRegister.getFunction('matrix4Multiply', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATRIX4,
				varName,
				value: func.asString(m1, m2, tmpVarName),
			},
		]);
	}
}
