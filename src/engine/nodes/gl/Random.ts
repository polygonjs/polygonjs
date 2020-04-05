import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'rand';

class RandomGlParamsConfig extends NodeParamsConfig {
	seed = ParamConfig.VECTOR2([1, 1]);
}
const ParamsConfig = new RandomGlParamsConfig();
export class RandomGlNode extends TypedGlNode<RandomGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'random';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// const function_declaration_lines = []

		// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
		// 		function_declaration_lines.push(`highp float rand2(vec2 co){
		// 	highp float a = 12.9898;
		// 	highp float b = 78.233;
		// 	highp float c = 43758.5453;
		// 	highp float dt= dot(co.xy ,vec2(a,b));
		// 	highp float sn= mod(dt,3.14);
		// 	return fract(sin(sn) * c);
		// }`)

		const input_name = this.io.inputs.named_input_connection_points[0].name;
		const value = ThreeToGl.vector2(this.variable_for_input(input_name));

		const float = this.gl_var_name(OUTPUT_NAME);
		const body_line = `float ${float} = rand(${value})`;
		// this.set_function_declaration_lines(function_declaration_lines)
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
