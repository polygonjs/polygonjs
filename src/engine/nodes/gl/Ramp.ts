import {TypedGlNode} from './_Base';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {UniformGLDefinition} from './utils/GLDefinition';
import {RampParam} from '../../params/Ramp';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';

const OUTPUT_NAME = 'val';

import {GlParamConfig} from './code/utils/ParamConfig';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class RampGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('ramp');
	input = ParamConfig.FLOAT(0);
}
const ParamsConfig = new RampGlParamsConfig();
export class RampGlNode extends TypedGlNode<RampGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'ramp';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const gl_type = GlConnectionPointType.FLOAT;
		const texture_name = this._uniform_name();
		const var_name = this.gl_var_name(OUTPUT_NAME);

		const definition = new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, texture_name);
		shaders_collection_controller.add_definitions(this, [definition]);

		const input_val = this.variable_for_input(this.p.input.name);
		const body_line = `${gl_type} ${var_name} = texture2D(${this._uniform_name()}, vec2(${input_val}, 0.0)).x`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
	set_param_configs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();
		const param_config = new GlParamConfig(
			ParamType.RAMP,
			this.pv.name,
			RampParam.DEFAULT_VALUE,
			this._uniform_name()
		);
		this._param_configs_controller.push(param_config);
	}
	private _uniform_name() {
		return 'ramp_texture_' + this.gl_var_name(OUTPUT_NAME);
	}
}
