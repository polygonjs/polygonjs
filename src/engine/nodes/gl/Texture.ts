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

import {TypedGlNode} from './_Base';

import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/ParamConfig';
class TextureParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('');
	defaultValue = ParamConfig.STRING('');
	uv = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new TextureParamsConfig();
export class TextureGlNode extends TypedGlNode<TextureParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'texture'> {
		return 'texture';
	}
	static readonly OUTPUT_NAME = 'rgba';
	private _onCreateSetNameIfNoneBound = this._onCreateSetNameIfNone.bind(this);
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterCreated(this._onCreateSetNameIfNoneBound);
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(TextureGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));

		const rgba = this.glVarName(TextureGlNode.OUTPUT_NAME);
		const map = this._uniform_name();
		const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, map);
		const body_line = `vec4 ${rgba} = texture2D(${map}, ${uv})`;
		shaders_collection_controller.addDefinitions(this, [definition]);
		shaders_collection_controller.addBodyLines(this, [body_line]);
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
			this.pv.defaultValue,
			this._uniform_name()
		);
		this._param_configs_controller.push(param_config);
	}
	private _uniform_name() {
		return this.glVarName(this.pv.paramName);
	}

	//
	//
	// HOOKS
	//
	//
	private _onCreateSetNameIfNone() {
		if (this.pv.paramName == '') {
			this.p.paramName.set(this.name());
		}
	}
}
