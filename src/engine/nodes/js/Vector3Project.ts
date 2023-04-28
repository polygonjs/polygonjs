/**
 * Projects this vector from world space into the camera's normalized device coordinate (NDC) space.
 *
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'position';
class Vector3ProjectJsParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3ProjectJsParamsConfig();
export class Vector3ProjectJsNode extends TypedJsNode<Vector3ProjectJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3Project';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.CAMERA, JsConnectionPointType.CAMERA, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const vector3 = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		const camera = this.variableForInput(shadersCollectionController, JsConnectionPointType.CAMERA);
		const out = this.jsVarName(OUTPUT_NAME);

		const tmpVarName =shadersCollectionController.addVariable(this, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('vector3Project', this, shadersCollectionController);
		const bodyLine = func.asString(vector3, camera, tmpVarName);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
