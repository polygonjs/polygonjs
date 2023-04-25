/**
 * creates a translation matrix
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

class Matrix4MakeTranslationJsParamsConfig extends NodeParamsConfig {
	/** @param t */
	t = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Matrix4MakeTranslationJsParamsConfig();
export class Matrix4MakeTranslationJsNode extends TypedJsNode<Matrix4MakeTranslationJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'matrix4MakeTranslation';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.MATRIX4, JsConnectionPointType.MATRIX4),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const t = this.variableForInputParam(linesController, this.p.t);
		const varName = this.jsVarName(JsConnectionPointType.MATRIX4);
		const tmpVarName = linesController.addVariable(this, new Matrix4());

		const func = Poly.namedFunctionsRegister.getFunction('matrix4MakeTranslation', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATRIX4,
				varName,
				value: func.asString(t, tmpVarName),
			},
		]);
	}
}
