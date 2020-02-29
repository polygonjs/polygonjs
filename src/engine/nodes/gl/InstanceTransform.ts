// import {BaseNodeGl} from './_Base';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {Definition} from './Definition/_Module';

// import QuaternionMethods from './Gl/quaternion.glsl';

// const VARS = {
// 	position: 'position',
// 	normal: 'normal',
// 	instancePosition: 'instancePosition',
// 	instanceOrientation: 'instanceOrientation',
// 	instanceScale: 'instanceScale',
// };

// export class InstanceTransform extends BaseNodeGl {
// 	static type() {
// 		return 'instance_transform';
// 	}

// 	constructor() {
// 		super();

// 		this.set_named_outputs([
// 			new Connection.Vec3(this.gl_output_name_position()),
// 			new Connection.Vec3(this.gl_output_name_normal()),
// 		]);
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR, VARS.position, [0, 0, 0]);
// 		this.add_param(ParamType.VECTOR, VARS.normal, [0, 0, 1]);
// 		this.add_param(ParamType.VECTOR, VARS.instancePosition, [0, 0, 0]);
// 		this.add_param(ParamType.VECTOR4, VARS.instanceOrientation, [0, 0, 0, 0]);
// 		this.add_param(ParamType.VECTOR, VARS.instanceScale, [1, 1, 1]);
// 	}

// 	set_lines() {
// 		const body_lines = [];
// 		const function_declaration_lines = [];

// 		function_declaration_lines.push(new Definition.Function(this, QuaternionMethods));

// 		const input_position = this.named_input(VARS.position);
// 		const position = input_position
// 			? ThreeToGl.float(this.variable_for_input(VARS.position))
// 			: this._create_default_position();

// 		const input_normal = this.named_input(VARS.normal);
// 		const normal = input_normal
// 			? ThreeToGl.float(this.variable_for_input(VARS.normal))
// 			: this._create_default_normal();

// 		const input_instancePosition = this.named_input(VARS.instancePosition);
// 		const instancePosition = input_instancePosition
// 			? ThreeToGl.float(this.variable_for_input(VARS.instancePosition))
// 			: this._create_default_instancePosition();
// 		// const instancePosition = ThreeToGl.float(this.variable_for_input('instancePosition'))

// 		const input_instanceOrientation = this.named_input(VARS.instanceOrientation);
// 		const instanceOrientation = input_instanceOrientation
// 			? ThreeToGl.float(this.variable_for_input(VARS.instanceOrientation))
// 			: this._create_default_input_instanceOrientation();

// 		const input_instanceScale = this.named_input(VARS.instanceScale);
// 		const instanceScale = input_instanceScale
// 			? ThreeToGl.float(this.variable_for_input(VARS.instanceScale))
// 			: this._create_default_input_instanceScale();

// 		const result_position = this.gl_var_name(this.gl_output_name_position());
// 		const result_normal = this.gl_var_name(this.gl_output_name_normal());
// 		body_lines.push(`vec3 ${result_position} = vec3(${position})`);
// 		body_lines.push(`${result_position} *= ${instanceScale}`);
// 		body_lines.push(`${result_position} = rotate_with_quat( ${result_position}, ${instanceOrientation} )`);
// 		body_lines.push(`${result_position} += ${instancePosition}`);
// 		body_lines.push(`vec3 ${result_normal} = vec3(${normal})`);
// 		body_lines.push(`${result_normal} = rotate_with_quat( ${result_normal}, ${instanceOrientation} )`);

// 		this.add_body_lines(body_lines);
// 		this.add_definitions(function_declaration_lines);
// 	}
// 	gl_output_name_position() {
// 		return 'position';
// 	}
// 	gl_output_name_normal() {
// 		return 'normal';
// 	}

// 	_create_default_position() {
// 		return VARS.position;
// 	}
// 	_create_default_normal() {
// 		return VARS.normal;
// 	}
// 	_create_default_instancePosition() {
// 		return this.assembler()
// 			.globals_handler()
// 			.read_attribute(this, 'vec3', VARS.instancePosition, this._shader_name);
// 	}
// 	_create_default_input_instanceOrientation() {
// 		return this.assembler()
// 			.globals_handler()
// 			.read_attribute(this, 'vec4', VARS.instanceOrientation, this._shader_name);
// 	}
// 	_create_default_input_instanceScale() {
// 		return this.assembler()
// 			.globals_handler()
// 			.read_attribute(this, 'vec3', VARS.instanceScale, this._shader_name);
// 	}
// }
