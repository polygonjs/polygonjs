/**
 * the texture node allows you to import a texture into your shaders.
 *
 * @remarks
 *
 * When this node is used inside a material or particles systems, a spare param will be added to the node, allowing you to select the texture node.
 * You'll then be able to read the texture values based on a uv input.
 *
 * And note that the uv input does not necessarily need to be an actual uv attribute on your geometry. It can be any attribute, any globals (like time) or function.
 *
 *
 *
 */
import {PrecisionGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/GLParamConfig';

class Texture2DArrayGlParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('texture3D1');
	// defaultValue = ParamConfig.STRING('');
	uv = ParamConfig.VECTOR2([0, 0]);
	layer = ParamConfig.INTEGER(4, {
		range: [1, 31],
	});
}
const ParamsConfig = new Texture2DArrayGlParamsConfig();
export class Texture2DArrayGlNode extends TypedGlNode<Texture2DArrayGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'texture2DArray'> {
		return 'texture2DArray';
	}
	static readonly OUTPUT_NAME = 'rgba';
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(Texture2DArrayGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);

		this.io.connection_points.spare_params.setInputlessParamNames(['tblur', 'resolution']);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const layer = ThreeToGl.float(this.variableForInputParam(this.p.layer));

		const rgba = this.glVarName(Texture2DArrayGlNode.OUTPUT_NAME);
		const map = this.uniformName();
		const definitions: BaseGLDefinition[] = [
			new PrecisionGLDefinition(this, GlConnectionPointType.SAMPLER_2D_ARRAY, 'highp'),
			new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D_ARRAY, map),
		];
		const bodyLines: string[] = [`vec4 ${rgba} = texture(${map}, vec3(${uv},${layer}))`];

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
		return `v_POLY_texture_${this.pv.paramName}`;
	}
}
