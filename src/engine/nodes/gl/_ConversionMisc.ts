import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

//
//
// FLOAT TO INT
//
//
const OUTPUT_NAME_INT = 'int';
class FloatToIntGlParamsConfig extends NodeParamsConfig {
	float = ParamConfig.FLOAT(0);
}
const ParamsConfigFloatToInt = new FloatToIntGlParamsConfig();
export class FloatToIntGlNode extends TypedGlNode<FloatToIntGlParamsConfig> {
	override paramsConfig = ParamsConfigFloatToInt;
	static override type() {
		return 'floatToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_INT, GlConnectionPointType.INT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const float = this.variableForInputParam(this.p.float);

		const int = this.glVarName(OUTPUT_NAME_INT);
		const body_line = `int ${int} = int(${ThreeToGl.float(float)})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}

//
//
// INT TO FLOAT
//
//
const OUTPUT_NAME_FLOAT = 'float';
class IntToFloatGlParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfigIntToFloat = new IntToFloatGlParamsConfig();
export class IntToFloatGlNode extends TypedGlNode<IntToFloatGlParamsConfig> {
	override paramsConfig = ParamsConfigIntToFloat;
	static override type() {
		return 'intToFloat';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_FLOAT, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const int = this.variableForInputParam(this.p.int);

		const float = this.glVarName(OUTPUT_NAME_FLOAT);
		const body_line = `float ${float} = float(${ThreeToGl.integer(int)})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}

//
//
// INT TO BOOL
//
//
const OUTPUT_NAME_BOOL = 'bool';
class IntToBoolGlParamsConfig extends NodeParamsConfig {
	int = ParamConfig.INTEGER(0);
}
const ParamsConfigIntToBool = new IntToBoolGlParamsConfig();
export class IntToBoolGlNode extends TypedGlNode<IntToBoolGlParamsConfig> {
	override paramsConfig = ParamsConfigIntToBool;
	static override type() {
		return 'intToBool';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_BOOL, GlConnectionPointType.BOOL),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const int = this.variableForInputParam(this.p.int);

		const bool = this.glVarName(OUTPUT_NAME_BOOL);
		const body_line = `bool ${bool} = bool(${ThreeToGl.integer(int)})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}

//
//
// BOOL TO INT
//
//
class BoolToIntGlParamsConfig extends NodeParamsConfig {
	bool = ParamConfig.BOOLEAN(0);
}
const ParamsConfigBoolToInt = new BoolToIntGlParamsConfig();
export class BoolToIntGlNode extends TypedGlNode<BoolToIntGlParamsConfig> {
	override paramsConfig = ParamsConfigBoolToInt;
	static override type() {
		return 'boolToInt';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_INT, GlConnectionPointType.INT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const bool = this.variableForInputParam(this.p.bool);

		const int = this.glVarName(OUTPUT_NAME_INT);
		const body_line = `int ${int} = int(${ThreeToGl.bool(bool)})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
