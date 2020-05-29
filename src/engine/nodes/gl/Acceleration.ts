import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {UniformGLDefinition, FunctionGLDefinition} from './utils/GLDefinition';
import {GlConstant} from '../../../core/geometry/GlConstant';
import {ThreeToGl} from '../../../core/ThreeToGl';
import Physics from './gl/physics.glsl';

enum AccelerationGlInput {
	POSITION = 'position',
	VELOCITY = 'velocity',
	MASS = 'mass',
	FORCE = 'force',
}
enum AccelerationGlOutput {
	POSITION = 'position',
	VELOCITY = 'velocity',
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AccelerationGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	velocity = ParamConfig.VECTOR3([0, 0, 0]);
	mass = ParamConfig.FLOAT(1);
	force = ParamConfig.VECTOR3([0, -9.8, 0]);
}
const ParamsConfig = new AccelerationGlParamsConfig();

export class AccelerationGlNode extends TypedGlNode<AccelerationGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'acceleration';
	}
	static readonly INPUT_NAME = 'export';
	// static readonly OUTPUT_NAMES = [AccelerationGlOutput.POSITION, AccelerationGlOutput.VELOCITY];

	initialize_node() {
		super.initialize_node();

		// this.io.inputs.set_named_input_connection_points([
		// 	new GlConnectionPoint(AccelerationGlInput.POSITION, GlConnectionPointType.VEC3),
		// 	new GlConnectionPoint(AccelerationGlInput.VELOCITY, GlConnectionPointType.VEC3),
		// 	new GlConnectionPoint(AccelerationGlInput.MASS, GlConnectionPointType.FLOAT),
		// 	new GlConnectionPoint(AccelerationGlInput.FORCE, GlConnectionPointType.VEC3),
		// ]);
		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(AccelerationGlOutput.POSITION, GlConnectionPointType.VEC3),
			new GlConnectionPoint(AccelerationGlOutput.VELOCITY, GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const delta_definition = new UniformGLDefinition(this, GlConnectionPointType.FLOAT, GlConstant.DELTA_TIME);
		const function_definition = new FunctionGLDefinition(this, Physics);
		shaders_collection_controller.add_definitions(this, [delta_definition, function_definition]);

		const input_position = ThreeToGl.vector3(this.variable_for_input(AccelerationGlInput.POSITION));
		const input_velocity = ThreeToGl.vector3(this.variable_for_input(AccelerationGlInput.VELOCITY));
		const input_mass = ThreeToGl.float(this.variable_for_input(AccelerationGlInput.MASS));
		const input_force = ThreeToGl.vector3(this.variable_for_input(AccelerationGlInput.FORCE));
		const position_result = this.gl_var_name(AccelerationGlOutput.POSITION);
		const velocity_result = this.gl_var_name(AccelerationGlOutput.VELOCITY);

		// args: vec3 vel, vec3 force, float mass, float time_delta
		const velocity_args = [input_velocity, input_force, input_mass, GlConstant.DELTA_TIME].join(', ');
		const velocity_body_line = `vec3 ${velocity_result} = compute_velocity_from_acceleration(${velocity_args})`;
		// vec3 position, vec3 velocity, float time_delta

		const position_args = [input_position, velocity_result, GlConstant.DELTA_TIME].join(', ');
		const position_body_line = `vec3 ${position_result} = compute_position_from_velocity(${position_args})`;

		shaders_collection_controller.add_body_lines(this, [velocity_body_line, position_body_line]);
	}
}
