import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
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

const INPUT_NAMES: AccelerationGlInput[] = [
	AccelerationGlInput.POSITION,
	AccelerationGlInput.VELOCITY,
	AccelerationGlInput.MASS,
	AccelerationGlInput.FORCE,
];
const OUTPUT_NAMES: AccelerationGlOutput[] = [AccelerationGlOutput.POSITION, AccelerationGlOutput.VELOCITY];
const INPUT_DEFAULT_VALUE: PolyDictionary<number | Number3> = {
	[AccelerationGlInput.POSITION]: [0, 0, 0],
	[AccelerationGlInput.VELOCITY]: [0, 0, 0],
	[AccelerationGlInput.MASS]: 1,
	[AccelerationGlInput.FORCE]: [0, -9.8, 0],
};

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class AccelerationGlParamsConfig extends NodeParamsConfig {
	// position = ParamConfig.VECTOR3([0, 0, 0]);
	// velocity = ParamConfig.VECTOR3([0, 0, 0]);
	// mass = ParamConfig.FLOAT(1);
	// force = ParamConfig.VECTOR3([0, -9.8, 0]);
}
const ParamsConfig = new AccelerationGlParamsConfig();

export class AccelerationGlNode extends TypedGlNode<AccelerationGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'acceleration';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(AccelerationGlOutput.POSITION, GlConnectionPointType.VEC3),
			new GlConnectionPoint(AccelerationGlOutput.VELOCITY, GlConnectionPointType.VEC3),
		]);

		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
	}

	protected _expected_input_types(): GlConnectionPointType[] {
		const type: GlConnectionPointType =
			this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
		return [type, type, GlConnectionPointType.FLOAT, type];
	}
	private _expected_output_types(): GlConnectionPointType[] {
		const in_type = this._expected_input_types()[0];
		return [in_type, in_type];
	}
	protected _gl_input_name(index: number) {
		return INPUT_NAMES[index];
	}
	protected _gl_output_name(index: number) {
		return OUTPUT_NAMES[index];
	}
	param_default_value(name: string) {
		return INPUT_DEFAULT_VALUE[name];
	}
	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const var_type = this.io.outputs.named_output_connection_points[0].type();
		const delta_definition = new UniformGLDefinition(this, GlConnectionPointType.FLOAT, GlConstant.DELTA_TIME);
		const function_definition = new FunctionGLDefinition(this, Physics);
		shaders_collection_controller.add_definitions(this, [delta_definition, function_definition]);

		const input_position = ThreeToGl.any(this.variable_for_input(AccelerationGlInput.POSITION));
		const input_velocity = ThreeToGl.any(this.variable_for_input(AccelerationGlInput.VELOCITY));
		const input_mass = ThreeToGl.float(this.variable_for_input(AccelerationGlInput.MASS));
		const input_force = ThreeToGl.any(this.variable_for_input(AccelerationGlInput.FORCE));
		const position_result = this.gl_var_name(AccelerationGlOutput.POSITION);
		const velocity_result = this.gl_var_name(AccelerationGlOutput.VELOCITY);

		const velocity_args = [input_velocity, input_force, input_mass, GlConstant.DELTA_TIME].join(', ');
		const velocity_body_line = `${var_type} ${velocity_result} = compute_velocity_from_acceleration(${velocity_args})`;

		const position_args = [input_position, velocity_result, GlConstant.DELTA_TIME].join(', ');
		const position_body_line = `${var_type} ${position_result} = compute_position_from_velocity(${position_args})`;

		shaders_collection_controller.add_body_lines(this, [velocity_body_line, position_body_line]);
	}
}
