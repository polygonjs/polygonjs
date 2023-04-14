/**
 * Computes the angle in radians between 2 vectors
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

const OUTPUT_NAME = 'radians';
class Vector3AngleToJsParamsConfig extends NodeParamsConfig {
	/** @param vector 1 */
	v1 = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param vector 2 */
	v2 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3AngleToJsParamsConfig();
export class Vector3AngleToJsNode extends TypedJsNode<Vector3AngleToJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3AngleTo';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const v1 = this.variableForInputParam(shadersCollectionController, this.p.v1);
		const v2 = this.variableForInputParam(shadersCollectionController, this.p.v2);
		const out = this.jsVarName(OUTPUT_NAME);

		const func = Poly.namedFunctionsRegister.getFunction('vector3AngleTo', this, shadersCollectionController);
		const bodyLine = func.asString(v1, v2);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.SPHERE, varName: out, value: bodyLine},
		]);
	}
}
