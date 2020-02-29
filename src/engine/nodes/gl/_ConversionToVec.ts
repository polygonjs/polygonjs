import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

//
//
// FLOAT TO VEC2
//
//
const OUTPUT_NAME_VEC2 = 'vec2';
class FloatToVec2GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
}
const ParamsConfig2 = new FloatToVec2GlParamsConfig();
export class FloatToVec2GlNode extends TypedGlNode<FloatToVec2GlParamsConfig> {
	params_config = ParamsConfig2;
	static type() {
		return 'float_to_vec2';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME_VEC2, ConnectionPointType.VEC2),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');

		const vec = this.gl_var_name(OUTPUT_NAME_VEC2);
		const body_line = `vec2 ${vec} = ${ThreeToGl.float2(x, y)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}

//
//
// FLOAT TO VEC3
//
//
const OUTPUT_NAME_VEC3 = 'vec3';
class FloatToVec3GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig3 = new FloatToVec3GlParamsConfig();
export class FloatToVec3GlNode extends TypedGlNode<FloatToVec3GlParamsConfig> {
	params_config = ParamsConfig3;
	static type() {
		return 'float_to_vec3';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME_VEC3, ConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');
		const z = this.variable_for_input('z');

		const vec = this.gl_var_name(OUTPUT_NAME_VEC3);
		const body_line = `vec3 ${vec} = ${ThreeToGl.float3(x, y, z)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}

//
//
// FLOAT TO VEC4
//
//
const OUTPUT_NAME_VEC4 = 'vec4';
class FloatToVec4GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
	w = ParamConfig.FLOAT(0);
}
const ParamsConfig4 = new FloatToVec4GlParamsConfig();
export class FloatToVec4GlNode extends TypedGlNode<FloatToVec4GlParamsConfig> {
	params_config = ParamsConfig4;
	static type() {
		return 'float_to_vec4';
	}

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME_VEC4, ConnectionPointType.VEC4),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');
		const z = this.variable_for_input('z');
		const w = this.variable_for_input('w');

		const vec = this.gl_var_name(OUTPUT_NAME_VEC4);
		const body_line = `vec4 ${vec} = ${ThreeToGl.float4(x, y, z, w)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
