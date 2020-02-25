import {TypedGlNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {
	ConnectionPointTypes,
	ConnectionPointType,
	ConnectionPointInitValueMap,
	ConnectionPointTypeToParamTypeMap,
} from '../utils/connections/ConnectionPointType';
import lodash_isArray from 'lodash/isArray';

const OUTPUT_NAME = 'val';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ParamType} from 'src/engine/poly/ParamType';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class ParamGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ConnectionPointTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	as_color = ParamConfig.BOOLEAN(0, {
		visible_if: {type: ConnectionPointTypes.indexOf(ConnectionPointType.VEC3)},
	});
}
const ParamsConfig = new ParamGlParamsConfig();

export class ParamGlNode extends TypedGlNode<ParamGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'param';
	}
	protected _allow_inputs_created_from_params: boolean = false;
	private _update_if_type_changed_bound = this._update_if_type_changed.bind(this);
	initialize_node() {
		this.update_output_type();

		this.add_post_dirty_hook('_update_if_type_changed', this._update_if_type_changed_bound);
	}
	private _update_if_type_changed(dirty_trigger?: CoreGraphNode) {
		if (dirty_trigger == this.p.type) {
			this.update_output_type();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const definitions = [];

		const gl_type = ConnectionPointTypes[this.pv.type];
		const var_name = this.uniform_name();

		definitions.push(new UniformGLDefinition(this, gl_type, var_name));
		shaders_collection_controller.add_definitions(this, definitions);
	}
	set_param_configs() {
		const gl_type = ConnectionPointTypes[this.pv.type];
		const default_value = ConnectionPointInitValueMap[gl_type];
		let param_type = ConnectionPointTypeToParamTypeMap[gl_type];

		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		if (
			param_type == ParamType.VECTOR3 &&
			this.p.as_color.value &&
			lodash_isArray(default_value) &&
			default_value.length == 3
		) {
			this._param_configs_controller.create_and_push(
				ParamType.COLOR,
				this.pv.name,
				default_value,
				this.uniform_name()
			);
		} else {
			this._param_configs_controller.create_and_push(
				param_type,
				this.pv.name,
				default_value,
				this.uniform_name()
			);
		}
	}
	uniform_name() {
		const output_connection_point = this.io.outputs.named_output_connection_points[0];
		const var_name = this.gl_var_name(output_connection_point.name);
		return var_name;
	}

	update_output_type() {
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointTypes[this.pv.type]),
		]);
	}
}
