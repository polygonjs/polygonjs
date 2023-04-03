/**
 * projects a vector onto a plane
 *
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const OUTPUT_NAME = 'position';
class Vector3ProjectOnPlaneJsParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([1, 0, 0]);
	/** @param planeNormal */
	planeNormal = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new Vector3ProjectOnPlaneJsParamsConfig();
export class Vector3ProjectOnPlaneJsNode extends TypedJsNode<Vector3ProjectOnPlaneJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3ProjectOnPlane';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const vector3 = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		const planeNormal = this.variableForInputParam(shadersCollectionController, this.p.planeNormal);
		const out = this.jsVarName(OUTPUT_NAME);

		shadersCollectionController.addVariable(this, out, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction(
			'vector3ProjectOnPlane',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(vector3, planeNormal, out);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
