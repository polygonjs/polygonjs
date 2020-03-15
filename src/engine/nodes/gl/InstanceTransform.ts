import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';

import QuaternionMethods from './gl/quaternion.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const VARS = {
	position: 'position',
	normal: 'normal',
	instance_position: 'instancePosition',
	instance_orientation: 'instanceOrientation',
	instance_scale: 'instanceScale',
};

class InstanceTransformGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 0, 1]);
	instance_position = ParamConfig.VECTOR3([0, 0, 0]);
	instance_orientation = ParamConfig.VECTOR4([0, 0, 0, 0]);
	instance_scale = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new InstanceTransformGlParamsConfig();
export class InstanceTransformGlNode extends TypedGlNode<InstanceTransformGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'instance_transform';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(this.gl_output_name_position(), ConnectionPointType.VEC3),
			new TypedNamedConnectionPoint(this.gl_output_name_normal(), ConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];
		const function_declaration_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, ConnectionPointType.VEC4, QuaternionMethods));

		const input_position = this.io.inputs.named_input(this.p.position.name);
		const position = input_position
			? ThreeToGl.float(this.variable_for_input(this.p.position.name))
			: this._default_position();

		const input_normal = this.io.inputs.named_input(this.p.normal.name);
		const normal = input_normal
			? ThreeToGl.float(this.variable_for_input(this.p.normal.name))
			: this._default_normal();

		const input_instancePosition = this.io.inputs.named_input(this.p.instance_position.name);
		const instancePosition = input_instancePosition
			? ThreeToGl.float(this.variable_for_input(this.p.instance_position.name))
			: this._default_instance_position(shaders_collection_controller);
		// const instancePosition = ThreeToGl.float(this.variable_for_input('instancePosition'))

		const input_instanceOrientation = this.io.inputs.named_input(this.p.instance_orientation.name);
		const instanceOrientation = input_instanceOrientation
			? ThreeToGl.float(this.variable_for_input(this.p.instance_orientation.name))
			: this._default_input_instance_orientation(shaders_collection_controller);

		const input_instanceScale = this.io.inputs.named_input(this.p.instance_scale.name);
		const instanceScale = input_instanceScale
			? ThreeToGl.float(this.variable_for_input(this.p.instance_scale.name))
			: this._default_input_instance_scale(shaders_collection_controller);

		const result_position = this.gl_var_name(this.gl_output_name_position());
		const result_normal = this.gl_var_name(this.gl_output_name_normal());
		body_lines.push(`vec3 ${result_position} = vec3(${position})`);
		body_lines.push(`${result_position} *= ${instanceScale}`);
		body_lines.push(`${result_position} = rotate_with_quat( ${result_position}, ${instanceOrientation} )`);
		body_lines.push(`${result_position} += ${instancePosition}`);
		body_lines.push(`vec3 ${result_normal} = vec3(${normal})`);
		body_lines.push(`${result_normal} = rotate_with_quat( ${result_normal}, ${instanceOrientation} )`);

		shaders_collection_controller.add_body_lines(this, body_lines);
		shaders_collection_controller.add_definitions(this, function_declaration_lines);
	}
	gl_output_name_position() {
		return 'position';
	}
	gl_output_name_normal() {
		return 'normal';
	}

	private _default_position(): string {
		return VARS.position;
	}
	private _default_normal(): string {
		return VARS.normal;
	}
	private _default_instance_position(shaders_collection_controller: ShadersCollectionController): string | undefined {
		return this.material_node?.assembler_controller.assembler.globals_handler?.read_attribute(
			this,
			ConnectionPointType.VEC3,
			VARS.instance_position,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec3', VARS.instance_position, this._shader_name);
	}
	private _default_input_instance_orientation(shaders_collection_controller: ShadersCollectionController) {
		return this.material_node?.assembler_controller.assembler.globals_handler?.read_attribute(
			this,
			ConnectionPointType.VEC4,
			VARS.instance_orientation,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec4', VARS.instance_orientation, this._shader_name);
	}
	private _default_input_instance_scale(shaders_collection_controller: ShadersCollectionController) {
		return this.material_node?.assembler_controller.assembler.globals_handler?.read_attribute(
			this,
			ConnectionPointType.VEC3,
			VARS.instance_scale,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec3', VARS.instance_scale, this._shader_name);
	}
}
