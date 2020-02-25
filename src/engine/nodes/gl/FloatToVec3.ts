import {TypedGlNode} from './_Base';
import {ThreeToGl} from 'src/core/ThreeToGl';

import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

const OUTPUT_NAME = 'vec3';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class FloatToVec3GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig = new FloatToVec3GlParamsConfig();
export class FloatToVec3GlNode extends TypedGlNode<FloatToVec3GlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'float_to_vec3';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');
		const z = this.variable_for_input('z');

		const vec = this.gl_var_name(OUTPUT_NAME);
		const body_line = `vec3 ${vec} = ${ThreeToGl.float3(x, y, z)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
