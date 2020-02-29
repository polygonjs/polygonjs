import {ParamTypeToConnectionPointTypeMap} from '../../utils/connections/ConnectionPointType';
import {BaseGlNodeType} from '../_Base';
import {BaseNamedConnectionPointType, TypedNamedConnectionPoint} from '../../utils/connections/NamedConnectionPoint';
// import {ParamValue} from '../../../params/types/ParamValue';
import {ParamType} from '../../../poly/ParamType';
// import {ParamValueToDefaultConverter} from '../../utils/params/ParamValueToDefaultConverter';
// import {NodeEvent} from '../../../poly/NodeEvent';
import {ParamsUpdateOptions} from '../../utils/params/ParamsController';
// import {ParamInitValueSerializedTypeMap} from '../../../params/types/ParamInitValueSerializedTypeMap';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';

export class GlNodeSpareParamsController {
	private _allow_inputs_created_from_params: boolean = true;
	private _inputless_param_names: string[] | undefined;
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
		for (let param_name of this.node.params.names) {
			let add_input = true;
			if (
				this._inputless_param_names &&
				this._inputless_param_names.length > 0 &&
				this._inputless_param_names.includes(param_name)
			) {
				add_input = false;
			}
			if (add_input) {
				if (this.node.params.has(param_name)) {
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
		}
		this.node.io.inputs.set_named_input_connection_points(connections);
	}
	set_inputless_param_names(names: string[]) {
		return (this._inputless_param_names = names);
	}
	create_spare_parameters() {
		const raw_input_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
		const default_value_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
		const current_param_names: string[] = this.node.params.spare_names;
		const params_update_options: ParamsUpdateOptions = {};

		for (let param_name of current_param_names) {
			if (this.node.params.has(param_name)) {
				const param = this.node.params.get(param_name);
				if (param) {
					raw_input_serialized_by_param_name.set(param_name, param.raw_input_serialized);
					default_value_serialized_by_param_name.set(param_name, param.default_value_serialized);
					params_update_options.names_to_delete = params_update_options.names_to_delete || [];
					params_update_options.names_to_delete.push(param_name);
				}
			}
		}

		for (let connection_point of this.node.io.inputs.named_input_connection_points) {
			const param_name = connection_point.name;
			const param_type: ParamType = connection_point.param_type;
			let init_value = connection_point.init_value;
			// let raw_input: ParamInitValueSerialized= null

			// const raw_input = raw_input_serialized_by_param_name.get(param_name);
			const last_param_init_value = default_value_serialized_by_param_name.get(param_name);
			// if (last_param_raw_input != null && last_param_init_value != null) {
			// init_value = ParamValueToDefaultConverter.from_value(param_type, last_param_raw_input);
			// if (init_value == null) {
			const default_value_from_name = this.node.gl_input_default_value(param_name);
			if (default_value_from_name != null) {
				init_value = default_value_from_name;
			} else {
				if (last_param_init_value != null) {
					init_value = last_param_init_value;
				} else {
					init_value = connection_point.init_value;
				}
			}

			// }
			// }
			// if (default_value == null) {
			// 	default_value = gl_connection.default_value();
			// }
			// if (init_value == null && connection_point.init_value) {
			// 	init_value = connection_point.init_value;
			// }

			if (init_value != null) {
				params_update_options.to_add = params_update_options.to_add || [];
				params_update_options.to_add.push({
					name: param_name,
					type: param_type,
					init_value: init_value as any,
					options: {
						spare: true,
						cook: false,
					},
				});
				// const param = this.node.add_param(param_type, param_name, init_value, {
				// 	spare: true,
				// 	cook: true,
				// });

				// if (param) {
				// 	has_created_a_param = true;
				// }
			}
		}
		if (!this.node.scene.loading_controller.is_loading) {
			this.node.params.update_params(params_update_options);

			for (let spare_param of this.node.params.spare) {
				if (!spare_param.parent_param) {
					const raw_input = raw_input_serialized_by_param_name.get(spare_param.name);
					if (raw_input) {
						spare_param.set(raw_input as any);
					}
				}
			}
		}
		// if (has_created_a_param || has_deleted_a_param) {
		// 	if (!this.node.scene.loading_controller.is_loading) {
		// 		this.node.params.post_create_spare_params();

		// 		this.node.emit(NodeEvent.PARAMS_UPDATED);
		// 	}
		// }
	}
}
