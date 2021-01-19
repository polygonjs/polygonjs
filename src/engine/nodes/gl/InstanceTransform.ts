import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';

import QuaternionMethods from './gl/quaternion.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const VARS = {
	position: 'position',
	normal: 'normal',
	instancePosition: 'instancePosition',
	instanceOrientation: 'instanceOrientation',
	instanceScale: 'instanceScale',
};

class InstanceTransformGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 0, 1]);
	instancePosition = ParamConfig.VECTOR3([0, 0, 0]);
	instanceOrientation = ParamConfig.VECTOR4([0, 0, 0, 0]);
	instanceScale = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new InstanceTransformGlParamsConfig();
export class InstanceTransformGlNode extends TypedGlNode<InstanceTransformGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'instanceTransform';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(this.gl_output_name_position(), GlConnectionPointType.VEC3),
			new GlConnectionPoint(this.gl_output_name_normal(), GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];
		const function_declaration_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, QuaternionMethods));

		const input_position = this.io.inputs.named_input(this.p.position.name());
		const position = input_position
			? ThreeToGl.float(this.variable_for_input(this.p.position.name()))
			: this._default_position();

		const input_normal = this.io.inputs.named_input(this.p.normal.name());
		const normal = input_normal
			? ThreeToGl.float(this.variable_for_input(this.p.normal.name()))
			: this._default_normal();

		const input_instancePosition = this.io.inputs.named_input(this.p.instancePosition.name());
		const instancePosition = input_instancePosition
			? ThreeToGl.float(this.variable_for_input(this.p.instancePosition.name()))
			: this._default_instancePosition(shaders_collection_controller);
		// const instancePosition = ThreeToGl.float(this.variable_for_input('instancePosition'))

		const input_instanceOrientation = this.io.inputs.named_input(this.p.instanceOrientation.name());
		const instanceOrientation = input_instanceOrientation
			? ThreeToGl.float(this.variable_for_input(this.p.instanceOrientation.name()))
			: this._default_input_instanceOrientation(shaders_collection_controller);

		const input_instanceScale = this.io.inputs.named_input(this.p.instanceScale.name());
		const instanceScale = input_instanceScale
			? ThreeToGl.float(this.variable_for_input(this.p.instanceScale.name()))
			: this._default_input_instanceScale(shaders_collection_controller);

		const result_position = this.gl_var_name(this.gl_output_name_position());
		const result_normal = this.gl_var_name(this.gl_output_name_normal());
		body_lines.push(`vec3 ${result_position} = vec3(${position})`);
		body_lines.push(`${result_position} *= ${instanceScale}`);
		body_lines.push(`${result_position} = rotateWithQuat( ${result_position}, ${instanceOrientation} )`);
		body_lines.push(`${result_position} += ${instancePosition}`);
		body_lines.push(`vec3 ${result_normal} = vec3(${normal})`);
		body_lines.push(`${result_normal} = rotateWithQuat( ${result_normal}, ${instanceOrientation} )`);

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
	private _default_instancePosition(shaders_collection_controller: ShadersCollectionController): string | undefined {
		return this.material_node?.assemblerController?.assembler.globals_handler?.read_attribute(
			this,
			GlConnectionPointType.VEC3,
			VARS.instancePosition,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec3', VARS.instancePosition, this._shader_name);
	}
	private _default_input_instanceOrientation(shaders_collection_controller: ShadersCollectionController) {
		return this.material_node?.assemblerController?.assembler.globals_handler?.read_attribute(
			this,
			GlConnectionPointType.VEC4,
			VARS.instanceOrientation,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec4', VARS.instanceOrientation, this._shader_name);
	}
	private _default_input_instanceScale(shaders_collection_controller: ShadersCollectionController) {
		return this.material_node?.assemblerController?.assembler.globals_handler?.read_attribute(
			this,
			GlConnectionPointType.VEC3,
			VARS.instanceScale,
			shaders_collection_controller
		);
		// return this.assembler()
		// 	.globals_handler()
		// 	.read_attribute(this, 'vec3', VARS.instanceScale, this._shader_name);
	}
}
