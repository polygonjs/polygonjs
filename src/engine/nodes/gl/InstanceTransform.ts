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
		const bodyLines = [];
		const functionDeclarationLines = [];

		functionDeclarationLines.push(new FunctionGLDefinition(this, QuaternionMethods));

		const inputPosition = this.io.inputs.named_input(this.p.position.name());
		const position = inputPosition
			? ThreeToGl.float(this.variableForInputParam(this.p.position))
			: this._defaultPosition();

		const inputNormal = this.io.inputs.named_input(this.p.normal.name());
		const normal = inputNormal ? ThreeToGl.float(this.variableForInputParam(this.p.normal)) : this._defaultNormal();

		const inputInstancePosition = this.io.inputs.named_input(this.p.instancePosition.name());
		const instancePosition = inputInstancePosition
			? ThreeToGl.float(this.variableForInputParam(this.p.instancePosition))
			: this._defaultInstancePosition(shaders_collection_controller);
		// const instancePosition = ThreeToGl.float(this.variableForInput('instancePosition'))

		const inputInstanceOrientation = this.io.inputs.named_input(this.p.instanceOrientation.name());
		const instanceOrientation = inputInstanceOrientation
			? ThreeToGl.float(this.variableForInputParam(this.p.instanceOrientation))
			: this._defaultInputInstanceOrientation(shaders_collection_controller);

		const inputInstanceScale = this.io.inputs.named_input(this.p.instanceScale.name());
		const instanceScale = inputInstanceScale
			? ThreeToGl.float(this.variableForInputParam(this.p.instanceScale))
			: this._defaultInputInstanceScale(shaders_collection_controller);

		const resultPosition = this.glVarName(this.gl_output_name_position());
		const resultNormal = this.glVarName(this.gl_output_name_normal());
		bodyLines.push(`vec3 ${resultPosition} = vec3(${position})`);
		bodyLines.push(`${resultPosition} *= ${instanceScale}`);
		bodyLines.push(`${resultPosition} = rotateWithQuat( ${resultPosition}, ${instanceOrientation} )`);
		bodyLines.push(`${resultPosition} += ${instancePosition}`);
		bodyLines.push(`vec3 ${resultNormal} = vec3(${normal})`);
		bodyLines.push(`${resultNormal} = rotateWithQuat( ${resultNormal}, ${instanceOrientation} )`);

		shaders_collection_controller.addBodyLines(this, bodyLines);
		shaders_collection_controller.addDefinitions(this, functionDeclarationLines);
	}
	gl_output_name_position() {
		return 'position';
	}
	gl_output_name_normal() {
		return 'normal';
	}

	private _defaultPosition(): string {
		return VARS.position;
	}
	private _defaultNormal(): string {
		return VARS.normal;
	}
	private _defaultInstancePosition(shaders_collection_controller: ShadersCollectionController): string | undefined {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler
			.globalsHandler()
			?.readAttribute(this, GlConnectionPointType.VEC3, VARS.instancePosition, shaders_collection_controller);
		// return this.assembler()
		// 	.globalsHandler()
		// 	.read_attribute(this, 'vec3', VARS.instancePosition, this._shader_name);
	}
	private _defaultInputInstanceOrientation(shaders_collection_controller: ShadersCollectionController) {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler
			.globalsHandler()
			?.readAttribute(this, GlConnectionPointType.VEC4, VARS.instanceOrientation, shaders_collection_controller);
		// return this.assembler()
		// 	.globalsHandler()
		// 	.read_attribute(this, 'vec4', VARS.instanceOrientation, this._shader_name);
	}
	private _defaultInputInstanceScale(shaders_collection_controller: ShadersCollectionController) {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		return assembler
			.globalsHandler()
			?.readAttribute(this, GlConnectionPointType.VEC3, VARS.instanceScale, shaders_collection_controller);
		// return this.assembler()
		// 	.globalsHandler()
		// 	.read_attribute(this, 'vec3', VARS.instanceScale, this._shader_name);
	}
}
