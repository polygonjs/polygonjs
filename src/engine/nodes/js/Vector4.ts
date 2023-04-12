/**
 * creates a Vector4
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = JsConnectionPointType.VECTOR3;
class Vector4JsParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector4 = ParamConfig.VECTOR4([0, 0, 0, 0]);
}
const ParamsConfig = new Vector4JsParamsConfig();
export class Vector4JsNode extends TypedJsNode<Vector4JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector4';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR4),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputValue = this.variableForInputParam(shadersCollectionController, this.p.Vector4);
		const varName = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR4,
				varName,
				value: inputValue,
			},
		]);
	}
}
