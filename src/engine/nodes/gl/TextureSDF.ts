/**
 * texture SDF
 *
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGLDefinition, PrecisionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/GLParamConfig';

class TextureSDFGlParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('texture1');
	p = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new TextureSDFGlParamsConfig();
export class TextureSDFGlNode extends TypedGlNode<TextureSDFGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'textureSDF'> {
		return 'textureSDF';
	}
	static readonly OUTPUT_NAME = 'd';
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(TextureSDFGlNode.OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const p = ThreeToGl.vector2(this.variableForInputParam(this.p.p));

		const rgba = this.glVarName(TextureSDFGlNode.OUTPUT_NAME);
		const map = this.uniformName();
		const definitions: BaseGLDefinition[] = [
			new PrecisionGLDefinition(this, GlConnectionPointType.SAMPLER_3D, 'highp'),
			new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_3D, map),
		];
		const bodyLines: string[] = [];

		const bodyLine = `float ${rgba} = texture(${map}, ${p}).r`;
		bodyLines.push(bodyLine);

		shaders_collection_controller.addDefinitions(this, definitions);
		shaders_collection_controller.addBodyLines(this, bodyLines);
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
	// override glVarName(name?: string) {
	// 	if (name) {
	// 		return super.glVarName(name);
	// 	}
	// 	return `v_POLY_texture_${this.pv.paramName}`;
	// }
	uniformName() {
		return `v_POLY_textureSDF_${this.pv.paramName}`;
	}
}
