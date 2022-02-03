/**
 * generates a ramp as a spare parameter, which can then be used to interpolate an input value.
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {UniformGLDefinition} from './utils/GLDefinition';
import {RampParam} from '../../params/Ramp';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

const OUTPUT_NAME = 'val';

import {GlParamConfig} from './code/utils/GLParamConfig';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class RampGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('ramp1');
	input = ParamConfig.FLOAT(0);
}
const ParamsConfig = new RampGlParamsConfig();
export class RampGlNode extends TypedGlNode<RampGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'ramp'> {
		return 'ramp';
	}
	override initializeNode() {
		super.initializeNode();

		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const tmpTextureGlType = GlConnectionPointType.VEC3;
		const tmpTexureVarName = super.glVarName('tmpTexureVarName');
		const glType = GlConnectionPointType.FLOAT;
		const texture_name = this.uniformName();
		const varName = super.glVarName(OUTPUT_NAME);

		const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, texture_name);
		shadersCollectionController.addDefinitions(this, [definition]);

		const inputVal = this.variableForInputParam(this.p.input);
		const bodyLines = [
			`${tmpTextureGlType} ${tmpTexureVarName} = texture2D(${this.uniformName()}, vec2(${inputVal}, 0.0)).xyz`,
			`${glType} ${varName} = -1.0 + ${tmpTexureVarName}.x + ${tmpTexureVarName}.y + ${tmpTexureVarName}.z`,
		];
		shadersCollectionController.addBodyLines(this, bodyLines);
	}
	override paramsGenerating() {
		return true;
	}
	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();
		const param_config = new GlParamConfig(
			ParamType.RAMP,
			this.pv.name,
			RampParam.DEFAULT_VALUE,
			this.uniformName()
		);
		this._param_configs_controller.push(param_config);
	}
	// override glVarName(name?: string): string {
	// 	if (name) {
	// 		return super.glVarName(name);
	// 	}
	// 	return `v_POLY_ramp_${this.pv.name}`;
	// }
	uniformName() {
		return `v_POLY_ramp_${this.pv.name}`;
	}
}
