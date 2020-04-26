import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'cross';

class CrossGlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.VECTOR3([0, 0, 1]);
	y = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new CrossGlParamsConfig();
export class CrossGlNode extends TypedGlNode<CrossGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'cross';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = ThreeToGl.float(this.variable_for_input('x'));
		const y = ThreeToGl.float(this.variable_for_input('y'));

		const result = this.gl_var_name(OUTPUT_NAME);
		const body_line = `vec3 ${result} = cross(${x}, ${y})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
