/**
 * creates a ay
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {Ray} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

class RayJsParamsConfig extends NodeParamsConfig {
	/** @param ray origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param ray direction */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new RayJsParamsConfig();
export class RayJsNode extends TypedJsNode<RayJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ray';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const origin = this.variableForInputParam(shadersCollectionController, this.p.origin);
		const direction = this.variableForInputParam(shadersCollectionController, this.p.direction);
		const out = this.jsVarName(JsConnectionPointType.RAY);

		const tmpVarName = shadersCollectionController.addVariable(this, new Ray());
		const func = Poly.namedFunctionsRegister.getFunction('raySet', this, shadersCollectionController);
		const bodyLine = func.asString(origin, direction, tmpVarName);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.RAY, varName: out, value: bodyLine},
		]);
	}
}
