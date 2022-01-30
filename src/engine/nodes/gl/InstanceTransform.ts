/**
 * This node updates the position and normals of instances
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';

import QuaternionMethods from './gl/quaternion.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';

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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'instanceTransform';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(this.gl_output_name_position(), GlConnectionPointType.VEC3),
			new GlConnectionPoint(this.gl_output_name_normal(), GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];
		const function_declaration_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, QuaternionMethods));

		const input_position = this.io.inputs.named_input(this.p.position.name());
		const position = input_position
			? ThreeToGl.float(this.variableForInputParam(this.p.position))
			: this._default_position();

		const input_normal = this.io.inputs.named_input(this.p.normal.name());
		const normal = input_normal
			? ThreeToGl.float(this.variableForInputParam(this.p.normal))
			: this._default_normal();

		const input_instancePosition = this.io.inputs.named_input(this.p.instancePosition.name());
		const instancePosition = input_instancePosition
			? ThreeToGl.float(this.variableForInputParam(this.p.instancePosition))
			: this._default_instancePosition(shaders_collection_controller);
		// const instancePosition = ThreeToGl.float(this.variableForInput('instancePosition'))

		const input_instanceOrientation = this.io.inputs.named_input(this.p.instanceOrientation.name());
		const instanceOrientation = input_instanceOrientation
			? ThreeToGl.float(this.variableForInputParam(this.p.instanceOrientation))
			: this._default_input_instanceOrientation(shaders_collection_controller);

		const input_instanceScale = this.io.inputs.named_input(this.p.instanceScale.name());
		const instanceScale = input_instanceScale
			? ThreeToGl.float(this.variableForInputParam(this.p.instanceScale))
			: this._default_input_instanceScale(shaders_collection_controller);

		const result_position = this.glVarName(this.gl_output_name_position());
		const result_normal = this.glVarName(this.gl_output_name_normal());
		body_lines.push(`vec3 ${result_position} = vec3(${position})`);
		body_lines.push(`${result_position} *= ${instanceScale}`);
		body_lines.push(`${result_position} = rotateWithQuat( ${result_position}, ${instanceOrientation} )`);
		body_lines.push(`${result_position} += ${instancePosition}`);
		body_lines.push(`vec3 ${result_normal} = vec3(${normal})`);
		body_lines.push(`${result_normal} = rotateWithQuat( ${result_normal}, ${instanceOrientation} )`);

		shaders_collection_controller.addBodyLines(this, body_lines);
		shaders_collection_controller.addDefinitions(this, function_declaration_lines);
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
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler.globals_handler?.readAttribute(
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
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler.globals_handler?.readAttribute(
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
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler.globals_handler?.readAttribute(
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
