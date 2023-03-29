/**
 * converts a float to a vector3
 *
 *
 */
import {TypedJsNode} from './_Base';
import {
	JsConnectionPointType,
	JsConnectionPoint,
	// ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Vector3} from 'three';
import {Poly} from '../../Poly';
// import {Vector3} from 'three';
// import {ParamType} from '../../poly/ParamType';
// const tmpV3 = new Vector3();

class FloatToVec3JsParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig3 = new FloatToVec3JsParamsConfig();
export class FloatToVec3JsNode extends TypedJsNode<FloatToVec3JsParamsConfig> {
	override paramsConfig = ParamsConfig3;
	static override type() {
		return 'floatToVec3';
	}
	static readonly OUTPUT_NAME = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(FloatToVec3JsNode.OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		// const bodyLines: string[] = [];

		const x = this.variableForInputParam(shadersCollectionController, this.p.x);
		const y = this.variableForInputParam(shadersCollectionController, this.p.y);
		const z = this.variableForInputParam(shadersCollectionController, this.p.z);

		const varName = this.jsVarName(FloatToVec3JsNode.OUTPUT_NAME);

		shadersCollectionController.addVariable(this, varName, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('floatToVec3', this, shadersCollectionController);
		// bodyLines.push(`${func.asString(x, y, z, varName)}`);

		// body_lines.push(`vec3 ${var_name} = vec3(${vec2}.xy, ${z})`);
		// shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(x, y, z, varName)},
		]);
	}
}
