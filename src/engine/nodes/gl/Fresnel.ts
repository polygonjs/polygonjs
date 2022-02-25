/**
 * fresnel returns the dot product between the surface normal and the eye vector.
 *
 * @remarks
 *
 * This can be very useful to affect transparency or reflection based on the angle at which a surface is viewed at.
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedGlNode} from './_Base';
import FresnelMethods from './gl/fresnel.glsl';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {ShaderAssemblerMaterial} from './code/assemblers/materials/_BaseMaterial';
import {Vector3Param} from '../../params/Vector3';
import {Vector4Param} from '../../params/Vector4';

const OUTPUT_NAME = 'fresnel';
class FresnelGlParamsConfig extends NodeParamsConfig {
	worldPosition = ParamConfig.VECTOR4([0, 0, 0, 0]);
	worldNormal = ParamConfig.VECTOR3([0, 0, 0]);
	cameraPosition = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new FresnelGlParamsConfig();
export class FresnelGlNode extends TypedGlNode<FresnelGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'fresnel';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const args = [
			this._varFromParam(this.p.worldPosition, ThreeToGl.vector4, shadersCollectionController),
			this._varFromParam(this.p.worldNormal, ThreeToGl.vector3, shadersCollectionController),
			this._varFromParam(this.p.cameraPosition, ThreeToGl.vector3, shadersCollectionController),
		];

		const output = this.glVarName(OUTPUT_NAME);
		const body_line = `float ${output} = fresnel(${args.join(',')})`;
		shadersCollectionController.addBodyLines(this, [body_line]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, FresnelMethods)]);
	}

	private _varFromParam(
		param: Vector3Param | Vector4Param,
		convertMethod: (str: string) => string,
		shadersCollectionController: ShadersCollectionController
	) {
		const varName = param.name();
		const input = this.io.inputs.named_input(param.name());
		if (input) {
			return convertMethod(this.variableForInputParam(param));
		} else {
			const glType = param instanceof Vector3Param ? GlConnectionPointType.VEC3 : GlConnectionPointType.VEC4;
			this._getGlobalVar(varName, glType, shadersCollectionController);
			return this.glVarName(varName);
		}
	}

	private _getGlobalVar(
		varName: string,
		glType: GlConnectionPointType,
		shadersCollectionController: ShadersCollectionController
	) {
		const assembler = shadersCollectionController.assembler() as ShaderAssemblerMaterial;
		assembler.globalsHandler()?.handleGlobalVar(this, varName, glType, shadersCollectionController);
	}
}
