/**
 * converts a float to a vector3
 *
 *
 */
import {TypedJsNode} from './_Base';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

//
//
// Int -> Bool
//
//
class IntToBoolJsParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfig_IntToBool = new IntToBoolJsParamsConfig();
export class IntToBoolJsNode extends TypedJsNode<IntToBoolJsParamsConfig> {
	override paramsConfig = ParamsConfig_IntToBool;
	static override type() {
		return 'intToBool';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.BOOLEAN, JsConnectionPointType.BOOLEAN),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const arg0 = this.variableForInputParam(shadersCollectionController, this.p.int);
		const varName = this.jsVarName(JsConnectionPointType.BOOLEAN);
		const func = Poly.namedFunctionsRegister.getFunction('intToBool', this, shadersCollectionController);

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(arg0)},
		]);
	}
}

//
//
// Bool -> Int
//
//
class BoolToIntJsParamsConfig extends NodeParamsConfig {
	bool = ParamConfig.INTEGER(0);
}
const ParamsConfig_BoolToInt = new BoolToIntJsParamsConfig();
export class BoolToIntJsNode extends TypedJsNode<BoolToIntJsParamsConfig> {
	override paramsConfig = ParamsConfig_BoolToInt;
	static override type() {
		return 'boolToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.INT, JsConnectionPointType.INT),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const arg0 = this.variableForInputParam(shadersCollectionController, this.p.bool);
		const varName = this.jsVarName(JsConnectionPointType.INT);
		const func = Poly.namedFunctionsRegister.getFunction('boolToInt', this, shadersCollectionController);

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(arg0)},
		]);
	}
}

//
//
// Int -> Float
//
//
class IntToFloatJsParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfig_IntToFloat = new IntToFloatJsParamsConfig();
export class IntToFloatJsNode extends TypedJsNode<IntToFloatJsParamsConfig> {
	override paramsConfig = ParamsConfig_IntToFloat;
	static override type() {
		return 'intToFloat';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.FLOAT, JsConnectionPointType.FLOAT),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const arg0 = this.variableForInputParam(shadersCollectionController, this.p.int);
		const varName = this.jsVarName(JsConnectionPointType.FLOAT);
		const func = Poly.namedFunctionsRegister.getFunction('intToFloat', this, shadersCollectionController);

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(arg0)},
		]);
	}
}

//
//
// Float -> Int
//
//
class FloatToIntJsParamsConfig extends NodeParamsConfig {
	float = ParamConfig.FLOAT(0);
}
const ParamsConfig_FloatToInt = new FloatToIntJsParamsConfig();
export class FloatToIntJsNode extends TypedJsNode<FloatToIntJsParamsConfig> {
	override paramsConfig = ParamsConfig_FloatToInt;
	static override type() {
		return 'floatToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.INT, JsConnectionPointType.INT),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const arg0 = this.variableForInputParam(shadersCollectionController, this.p.float);
		const varName = this.jsVarName(JsConnectionPointType.INT);
		const func = Poly.namedFunctionsRegister.getFunction('floatToInt', this, shadersCollectionController);

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(arg0)},
		]);
	}
}
