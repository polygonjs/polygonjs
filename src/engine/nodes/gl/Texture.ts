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
import TextureBlur from './gl/textureBlur.glsl';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGLDefinition, FunctionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {isBooleanTrue} from '../../../core/Type';
import {ParamOptions} from '../../params/utils/OptionsController';
import {UNIFORM_TEXTURE_PREFIX} from '../../../core/material/uniform';
import {GlType} from '../../poly/registers/nodes/types/Gl';

const blurParamVisibility: ParamOptions = {
	visibleIf: {tblur: 1},
};
class TextureGlParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('texture1');
	// defaultValue = ParamConfig.STRING('');
	uv = ParamConfig.VECTOR2([0, 0]);
	tblur = ParamConfig.BOOLEAN(0);
	resolution = ParamConfig.VECTOR2([256, 256], blurParamVisibility);
	blurPixelsCountX = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, true],
		...blurParamVisibility,
	});
	blurPixelsCountY = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, true],
		...blurParamVisibility,
	});
}
const ParamsConfig = new TextureGlParamsConfig();
export class TextureGlNode extends TypedGlNode<TextureGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<GlType.TEXTURE> {
		return GlType.TEXTURE;
	}
	static readonly OUTPUT_NAME = 'rgba';
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(TextureGlNode.OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);

		this.io.connection_points.spare_params.setInputlessParamNames(['tblur', 'resolution']);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));

		const rgba = this.glVarName(TextureGlNode.OUTPUT_NAME);
		const map = this.uniformName();
		const definitions: BaseGLDefinition[] = [new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, map)];
		const bodyLines: string[] = [];

		if (isBooleanTrue(this.pv.tblur)) {
			const resolution = ThreeToGl.vector2(this.variableForInputParam(this.p.resolution));
			const blurPixelsCountX = ThreeToGl.integer(this.variableForInputParam(this.p.blurPixelsCountX));
			const blurPixelsCountY = ThreeToGl.integer(this.variableForInputParam(this.p.blurPixelsCountY));
			const body_line = `vec4 ${rgba} = textureBlur(
				${map},
				${uv},
				${resolution},
				${blurPixelsCountX},
				${blurPixelsCountY}
				)`;
			bodyLines.push(body_line);
			definitions.push(new FunctionGLDefinition(this, TextureBlur));
		} else {
			const body_line = `vec4 ${rgba} = texture2D(${map}, ${uv})`;
			bodyLines.push(body_line);
		}

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
		return `${UNIFORM_TEXTURE_PREFIX}${this.pv.paramName}`;
	}
}
