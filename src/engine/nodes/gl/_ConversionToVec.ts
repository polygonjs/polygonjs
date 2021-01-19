import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

//
//
// FLOAT TO VEC2
//
//
class FloatToVec2GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
}
const ParamsConfig2 = new FloatToVec2GlParamsConfig();
export class FloatToVec2GlNode extends TypedGlNode<FloatToVec2GlParamsConfig> {
	params_config = ParamsConfig2;
	static type() {
		return 'floatToVec2';
	}
	static readonly OUTPUT_NAME = 'vec2';

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(FloatToVec2GlNode.OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');

		const vec = this.gl_var_name(FloatToVec2GlNode.OUTPUT_NAME);
		const body_line = `vec2 ${vec} = ${ThreeToGl.float2(x, y)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}

//
//
// FLOAT TO VEC3
//
//
class FloatToVec3GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig3 = new FloatToVec3GlParamsConfig();
export class FloatToVec3GlNode extends TypedGlNode<FloatToVec3GlParamsConfig> {
	params_config = ParamsConfig3;
	static type() {
		return 'floatToVec3';
	}
	static readonly OUTPUT_NAME = 'vec3';

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(FloatToVec3GlNode.OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');
		const z = this.variable_for_input('z');

		const vec = this.gl_var_name(FloatToVec3GlNode.OUTPUT_NAME);
		const body_line = `vec3 ${vec} = ${ThreeToGl.float3(x, y, z)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}

//
//
// FLOAT TO VEC4
//
//
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
		return 'floatToVec4';
	}
	static readonly OUTPUT_NAME = 'vec4';

	initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(FloatToVec4GlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const x = this.variable_for_input('x');
		const y = this.variable_for_input('y');
		const z = this.variable_for_input('z');
		const w = this.variable_for_input('w');

		const vec = this.gl_var_name(FloatToVec4GlNode.OUTPUT_NAME);
		const body_line = `vec4 ${vec} = ${ThreeToGl.float4(x, y, z, w)}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
