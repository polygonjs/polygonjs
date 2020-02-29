import {ParamTypeToConnectionPointTypeMap} from '../../utils/connections/ConnectionPointType';
import {BaseGlNodeType} from '../_Base';
import {BaseNamedConnectionPointType, TypedNamedConnectionPoint} from '../../utils/connections/NamedConnectionPoint';
import {ParamValue} from '../../../params/types/ParamValue';
import {ParamType} from '../../../poly/ParamType';
import {ParamValueToDefaultConverter} from '../../utils/params/ParamValueToDefaultConverter';
import {NodeEvent} from '../../../poly/NodeEvent';

export class GlNodeSpareParamsController {
	private _allow_inputs_created_from_params: boolean = true;
	constructor(private node: BaseGlNodeType) {}

	disallow_inputs_created_from_params() {
		this._allow_inputs_created_from_params = false;
	}

	initialize_node() {
		this.node.params.set_post_create_params_hook(this.create_inputs_from_params.bind(this));
	}

	create_inputs_from_params() {
		if (!this._allow_inputs_created_from_params) {
			return;
		}
		const connections: BaseNamedConnectionPointType[] = [];
		const inputless_params_names = this.inputless_params_names();
		for (let param_name of this.node.params.names) {
			let add_input = true;
			if (inputless_params_names.length > 0 && inputless_params_names.includes(param_name)) {
				add_input = false;
			}
			if (add_input) {
				const param = this.node.params.get(param_name);
				if (param && !param.parent_param) {
					const connection_type = ParamTypeToConnectionPointTypeMap[param.type];
					if (connection_type) {
						const connection = new TypedNamedConnectionPoint(param.name, connection_type);
						connections.push(connection);
					}
				}
			}
		}
		this.node.io.inputs.set_named_input_connection_points(connections);
	}
	inputless_params_names(): string[] {
		return [];
	}
	create_spare_parameters() {
		const values_by_param_name: Map<string, ParamValue> = new Map();
		const current_param_names: string[] = this.node.params.spare_names;
		let has_deleted_a_param = false;
		let has_created_a_param = false;
		for (let param_name of current_param_names) {
			const param = this.node.params.get(param_name);
			if (param) {
				values_by_param_name.set(param_name, param.value);
				this.node.params.delete_param(param_name);
				has_deleted_a_param = true;
			}
		}

		for (let connection_point of this.node.io.inputs.named_input_connection_points) {
			const param_name = connection_point.name;

			const last_param_value = values_by_param_name.get(param_name);
			if (last_param_value != null) {
				const param_type: ParamType = connection_point.param_type;
				let init_value = ParamValueToDefaultConverter.from_value(param_type, last_param_value);
				if (init_value == null) {
					const default_value_from_name = this.node.gl_input_default_value(param_name);
					if (default_value_from_name != null) {
						init_value = default_value_from_name;
					}
				}
				// if (default_value == null) {
				// 	default_value = gl_connection.default_value();
				// }
				if (init_value == null && connection_point.init_value) {
					init_value = connection_point.init_value;
				}

				this.node.add_param(param_type, param_name, init_value, {
					spare: true,
					cook: true,
				});
				has_created_a_param = true;
			}
		}

		if (has_created_a_param || has_deleted_a_param) {
			if (!this.node.scene.loading_controller.is_loading) {
				this.node.emit(NodeEvent.PARAMS_UPDATED);
			}
		}
	}
}
