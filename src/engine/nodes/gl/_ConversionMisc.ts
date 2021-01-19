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
	params_config = ParamsConfigFloatToInt;
	static type() {
		return 'floatToInt';
	}

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_INT, GlConnectionPointType.INT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const float = this.variable_for_input('float');

		const int = this.gl_var_name('int');
		const body_line = `int ${int} = int(${ThreeToGl.float(float)})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
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
	params_config = ParamsConfigIntToFloat;
	static type() {
		return 'intToFloat';
	}

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_FLOAT, GlConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const int = this.variable_for_input('int');

		const float = this.gl_var_name('float');
		const body_line = `float ${float} = float(${ThreeToGl.int(int)})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
