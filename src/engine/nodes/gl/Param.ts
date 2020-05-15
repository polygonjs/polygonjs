import {TypedGlNode} from './_Base';
import {
	GL_CONNECTION_POINT_TYPES,
	// GlConnectionPoint,
	GlConnectionPointType,
	GlConnectionPointInitValueMap,
	GlConnectionPointTypeToParamTypeMap,
} from '../utils/io/connections/Gl';
import lodash_isArray from 'lodash/isArray';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamType} from '../../poly/ParamType';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {GlConnectionsController} from './utils/GLConnectionsController';
import {GlParamConfig} from './code/utils/ParamConfig';
class ParamGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	as_color = ParamConfig.BOOLEAN(0, {
		visible_if: {type: GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.VEC3)},
	});
}
const ParamsConfig = new ParamGlParamsConfig();

export class ParamGlNode extends TypedGlNode<ParamGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'param';
	}
	protected _allow_inputs_created_from_params: boolean = false;
	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	// private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		this.add_post_dirty_hook('_set_mat_to_recompile', this._set_mat_to_recompile.bind(this));
		this.lifecycle.add_on_create_hook(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initialize_node();

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [GL_CONNECTION_POINT_TYPES[this.pv.type]]);
		// this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		// this.params.set_post_create_params_hook(this._update_signature_if_required_bound);
		// this.add_post_dirty_hook('_update_if_type_changed', this._update_signature_if_required_bound);
	}
	// private _update_signature_if_required(dirty_trigger?: CoreGraphNode) {
	// 	if (!this.lifecycle.creation_completed || dirty_trigger == this.p.type) {
	// 		this.update_output_type();
	// 		this.remove_dirty_state();
	// 		this.make_output_nodes_dirty();
	// 	}
	// }

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const definitions = [];

		const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		const var_name = this.uniform_name();

		definitions.push(new UniformGLDefinition(this, gl_type, var_name));
		shaders_collection_controller.add_definitions(this, definitions);
	}
	set_param_configs() {
		const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		const default_value = GlConnectionPointInitValueMap[gl_type];
		let param_type = GlConnectionPointTypeToParamTypeMap[gl_type];

		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		if (
			param_type == ParamType.VECTOR3 &&
			this.p.as_color.value &&
			lodash_isArray(default_value) &&
			default_value.length == 3
		) {
			const param_config = new GlParamConfig(ParamType.COLOR, this.pv.name, default_value, this.uniform_name());
			this._param_configs_controller.push(param_config);
		} else {
			const param_config = new GlParamConfig(param_type, this.pv.name, default_value, this.uniform_name());
			this._param_configs_controller.push(param_config);
		}
	}
	uniform_name() {
		const output_connection_point = this.io.outputs.named_output_connection_points[0];
		const var_name = this.gl_var_name(output_connection_point.name);
		return var_name;
	}
	set_gl_type(type: GlConnectionPointType) {
		const index = GL_CONNECTION_POINT_TYPES.indexOf(type);
		this.p.type.set(index);
	}

	// update_output_type() {
	// 	const set_dirty = false;
	// 	this.io.outputs.set_named_output_connection_points(
	// 		[new TypedNamedConnectionPoint(OUTPUT_NAME, ConnectionPointTypes[this.pv.type])],
	// 		set_dirty
	// 	);
	// }
	//
	//
	// HOOKS
	//
	//
	private _on_create_set_name_if_none() {
		if (this.pv.name == '') {
			this.p.name.set(this.name);
		}
	}
}
