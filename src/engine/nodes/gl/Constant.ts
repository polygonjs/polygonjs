import {TypedGlNode} from './_Base';
import {ThreeToGl} from 'src/core/ThreeToGl';

// const OUTPUT_NAME = 'longer_name_to_test';

import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType, ConnectionPointTypes} from '../utils/connections/ConnectionPointType';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

function typed_visible_options(type: ConnectionPointType) {
	const val = ConnectionPointTypes.indexOf(type);
	return {visible_if: {type: val}};
}

import {BaseParamType} from 'src/engine/params/_Base';
import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class ConstantGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ConnectionPointTypes.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	value_bool = ParamConfig.BOOLEAN(0, typed_visible_options(ConnectionPointType.BOOL));
	value_int = ParamConfig.INTEGER(0, typed_visible_options(ConnectionPointType.INT));
	value_float = ParamConfig.FLOAT(0, typed_visible_options(ConnectionPointType.FLOAT));
	value_vec2 = ParamConfig.VECTOR2([0, 0], typed_visible_options(ConnectionPointType.VEC2));
	value_vec3 = ParamConfig.VECTOR3([0, 0, 0], typed_visible_options(ConnectionPointType.VEC3));
	value_vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typed_visible_options(ConnectionPointType.VEC4));
}
const ParamsConfig = new ConstantGlParamsConfig();
export class ConstantGlNode extends TypedGlNode<ConstantGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'constant';
	}
	private _params_by_type: Map<ConnectionPointType, BaseParamType> | undefined;
	protected _allow_inputs_created_from_params: boolean = false;
	private _update_signature_if_required_bound = this._update_signature_if_required.bind(this);
	initialize_node() {
		this.params.add_on_scene_load_hook('_update_signature_if_required', this._update_signature_if_required_bound);
		this.add_post_dirty_hook('_update_signature_if_required', this._update_signature_if_required_bound);
	}
	_update_signature_if_required(dirty_trigger?: CoreGraphNode) {
		if (!this.lifecycle.creation_completed || dirty_trigger == this.p.type) {
			this.update_output_type();
			this.remove_dirty_state();
			this.make_output_nodes_dirty();
		}
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const param = this._current_param;
		if (param) {
			const connection_type = this._current_connection_type;
			const value = ThreeToGl.any(param.value);
			const var_value = this._current_var_name;
			const body_line = `${connection_type} ${var_value} = ${value}`;
			shaders_collection_controller.add_body_lines(this, [body_line]);
		} else {
			console.warn(`no param found for constant node for type '${this.pv.type}'`);
		}
	}

	private get _current_connection_type() {
		if (this.pv.type == null) {
			console.warn('constant gl node type if not valid');
		}
		const connection_type = ConnectionPointTypes[this.pv.type];
		if (connection_type == null) {
			console.warn('constant gl node type if not valid');
		}
		return connection_type;
	}

	private get _current_param(): BaseParamType {
		this._params_by_type =
			this._params_by_type ||
			new Map<ConnectionPointType, BaseParamType>([
				[ConnectionPointType.BOOL, this.p.value_bool],
				[ConnectionPointType.INT, this.p.value_int],
				[ConnectionPointType.FLOAT, this.p.value_float],
				[ConnectionPointType.VEC2, this.p.value_vec2],
				[ConnectionPointType.VEC3, this.p.value_vec3],
				[ConnectionPointType.VEC4, this.p.value_vec4],
			]);
		const connection_type = ConnectionPointTypes[this.pv.type];
		return this._params_by_type.get(connection_type)!;
	}
	private get _current_var_name(): string {
		return this.gl_var_name(this._current_connection_type);
	}

	private update_output_type() {
		const current_connection = this.io.outputs.named_output_connection_points[0];
		if (current_connection && current_connection.type == this._current_connection_type) {
			return;
		}
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint(this._current_connection_type, this._current_connection_type),
		]);
	}
}
