/**
 * creates a Vector2
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
class Vector2JsParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector2 = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new Vector2JsParamsConfig();
export class Vector2JsNode extends TypedJsNode<Vector2JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector2';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR2),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const inputValue = this.variableForInputParam(shadersCollectionController, this.p.Vector2);
		const varName = this.jsVarName(OUTPUT_NAME);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.VECTOR2,
				varName,
				value: inputValue,
			},
		]);
	}
}
