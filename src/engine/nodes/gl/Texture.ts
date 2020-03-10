import {TypedGlNode} from './_Base';
import {FileCopNode} from '../cop/File';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'rgba';

class TextureParamsConfig extends NodeParamsConfig {
	param_name = ParamConfig.STRING('texture_map');
	default_value = ParamConfig.STRING(FileCopNode.DEFAULT_NODE_PATH.UV);
	uv = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new TextureParamsConfig();
export class TextureGlNode extends TypedGlNode<TextureParamsConfig> {
	param_config = ParamsConfig;
	static type() {
		return 'texture';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointType.VEC4),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variable_for_input(this.p.uv.name));

		const rgba = this.gl_var_name(OUTPUT_NAME);
		const map = this._uniform_name();
		const definition = new UniformGLDefinition(this, ConnectionPointType.SAMPLER_2D, map);
		const body_line = `vec4 ${rgba} = texture2D(${map}, ${uv})`;
		shaders_collection_controller.add_definitions(this, [definition]);
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}

	set_param_configs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		this._param_configs_controller.create_and_push(
			ParamType.OPERATOR_PATH,
			this.pv.param_name,
			this.pv.default_value,
			this._uniform_name()
		);
	}
	private _uniform_name() {
		return this.gl_var_name(this.pv.param_name);
	}
}
