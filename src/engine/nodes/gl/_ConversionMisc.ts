import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
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
		return 'float_to_int';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME_INT, ConnectionPointType.INT),
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
		return 'int_to_float';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME_FLOAT, ConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const int = this.variable_for_input('int');

		const float = this.gl_var_name('float');
		const body_line = `float ${float} = float(${ThreeToGl.int(int)})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
