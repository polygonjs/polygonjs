/**
 * computes displacement based on a texture.
 *
 * @remarks
 *
 * Normals are computed based on the UV.
 *
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {GlType} from '../../poly/registers/nodes/types/Gl';
import {TypedGlNode} from './_Base';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {ParamType} from '../../poly/ParamType';
import {UNIFORM_TEXTURE_PREFIX} from '../../../core/material/uniform';
import {BaseGLDefinition, FunctionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import TEXTURE_DISPLACEMENT from './gl/textureDisplacement.glsl';
import TEXTURE_DISPLACEMENT_RESULT from './gl/textureDisplacementResult.glsl';

export enum DisplacementTextureOutput {
	P = 'P',
	N = 'N',
}
const COMPONENTS = ['x', 'y', 'z', 'w'];

class TextureDisplacementGlParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('');
	position = ParamConfig.VECTOR3([0, 0, 0]);
	normal = ParamConfig.VECTOR3([0, 0, 0]);
	uv = ParamConfig.VECTOR2([0, 0]);
	amount = ParamConfig.FLOAT(1, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	textureSize = ParamConfig.VECTOR2([512, 512]);
	tangentsPosOffset = ParamConfig.VECTOR2([0.01, 0.01]);
	textureComponent = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new TextureDisplacementGlParamsConfig();

export class TextureDisplacementGlNode extends TypedGlNode<TextureDisplacementGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.TEXTURE_DISPLACEMENT;
	}

	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(DisplacementTextureOutput.P, GlConnectionPointType.VEC3),
			new GlConnectionPoint(DisplacementTextureOutput.N, GlConnectionPointType.VEC3),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['textureComponent']);
	}

	override setLines(linesController: ShadersCollectionController) {
		const map = this.uniformName();
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const textureSize = ThreeToGl.vector2(this.variableForInputParam(this.p.textureSize));
		const amount = ThreeToGl.float(this.variableForInputParam(this.p.amount));
		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const normal = ThreeToGl.vector3(this.variableForInputParam(this.p.normal));
		const tangentsPosOffset = ThreeToGl.vector3(this.variableForInputParam(this.p.tangentsPosOffset));
		const component = COMPONENTS[this.pv.textureComponent];

		const textureDisplacementFunctionDeclaration = TEXTURE_DISPLACEMENT.replace(/__COMPONENT__/g, component);
		const textureDisplacementFunctionName = `textureDisplacement__COMPONENT__`.replace(/__COMPONENT__/g, component);

		const out = this.glVarName('out');
		const outPosition = this.glVarName(DisplacementTextureOutput.P);
		const outNormal = this.glVarName(DisplacementTextureOutput.N);
		const definitions: BaseGLDefinition[] = [
			new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, map),
			new FunctionGLDefinition(this, TEXTURE_DISPLACEMENT_RESULT),
			new FunctionGLDefinition(this, textureDisplacementFunctionDeclaration),
		];

		const args = [map, uv, textureSize, amount, position, normal, tangentsPosOffset];
		const bodyLines: string[] = [
			`TextureDisplacementResult ${out} = ${textureDisplacementFunctionName}(${args.join(', ')})`,
			`vec3 ${outPosition} = ${out}.position`,
			`vec3 ${outNormal} = ${out}.normal`,
		];

		linesController.addDefinitions(this, definitions);
		linesController.addBodyLines(this, bodyLines);
	}
	override paramsGenerating() {
		return true;
	}

	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const param_config = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.paramName,
			'', //this.pv.defaultValue,
			this.uniformName()
		);
		this._param_configs_controller.push(param_config);
	}

	uniformName() {
		return `${UNIFORM_TEXTURE_PREFIX}${this.pv.paramName}`;
	}
}
