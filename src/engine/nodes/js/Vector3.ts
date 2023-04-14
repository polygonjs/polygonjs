/**
 * creates a Vector3
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

const OUTPUT_NAME = JsConnectionPointType.VECTOR3;
class Vector3JsParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3JsParamsConfig();
export class Vector3JsNode extends TypedJsNode<Vector3JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const inputValue = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		const varName = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR3,
				varName,
				value: inputValue,
			},
		]);
	}
}
