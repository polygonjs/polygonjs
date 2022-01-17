import {TypedGlNode} from './_Base';

import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/ParamConfig';
import {NODE_PATH_DEFAULT} from '../../../core/Walker';
class TextureParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('textureMap');
	defaultValue = ParamConfig.STRING(NODE_PATH_DEFAULT.NODE.UV);
	uv = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new TextureParamsConfig();
export class TextureGlNode extends TypedGlNode<TextureParamsConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'texture'> {
		return 'texture';
	}
	static readonly OUTPUT_NAME = 'rgba';

	initializeNode() {
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_mat_to_recompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(TextureGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));

		const rgba = this.glVarName(TextureGlNode.OUTPUT_NAME);
		const map = this._uniform_name();
		const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, map);
		const body_line = `vec4 ${rgba} = texture2D(${map}, ${uv})`;
		shaders_collection_controller.addDefinitions(this, [definition]);
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
	paramsGenerating() {
		return true;
	}

	setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const param_config = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.paramName,
			this.pv.defaultValue,
			this._uniform_name()
		);
		this._param_configs_controller.push(param_config);
	}
	private _uniform_name() {
		return this.glVarName(this.pv.paramName);
	}
}
