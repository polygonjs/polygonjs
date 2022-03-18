import {Number2} from '../../../../types/GlobalTypes';
import {
	ConnectionPointTypeMap,
	ConnectionPointEnumMap,
	param_type_to_connection_point_type_map,
	create_connection_point,
} from './connections/ConnectionMap';
import {ParamType} from '../../../poly/ParamType';
import {ParamsUpdateOptions} from '../params/ParamsController';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {CoreType} from '../../../../core/Type';
import {ObjectUtils} from '../../../../core/ObjectUtils';

/*
GlNodeSpareParamsController creates spare params from inputs on gl nodes
*/
export class ConnectionPointsSpareParamsController<NC extends NodeContext> {
	// private _allow_inputs_created_from_params: boolean = true;
	private _inputless_param_names: string[] | undefined;
	private _raw_input_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	private _default_value_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	constructor(private node: TypedNode<NC, any>, private _context: NC) {}

	// disallow_inputs_created_from_params() {
	// 	this._allow_inputs_created_from_params = false;
	// }

	private _initialized = false;
	initializeNode() {
		if (this._initialized) {
			console.warn('already initialized', this.node);
			return;
		}
		this._initialized = true;
		this.node.params.onParamsCreated('createInputsFromParams', this._createInputsFromParams.bind(this));
	}
	initialized() {
		return this._initialized;
	}

	private _createInputsFromParams() {
		// if (!this._allow_inputs_created_from_params) {
		// 	return;
		// }
		const connection_type_map = param_type_to_connection_point_type_map(this._context);
		if (!connection_type_map) {
			return;
		}

		const connection_points: ConnectionPointTypeMap[NC][] = [];
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
					if (param && !param.parentParam()) {
						const connection_type = connection_type_map[param.type()] as ConnectionPointEnumMap[NC];
						if (connection_type) {
							const connection_point = create_connection_point(
								this._context,
								param.name(),
								connection_type
							) as ConnectionPointTypeMap[NC];
							if (connection_point) {
								connection_points.push(connection_point);
							}
						}
					}
				}
			}
		}
		this.node.io.inputs.setNamedInputConnectionPoints(connection_points);
	}

	setInputlessParamNames(names: string[]) {
		return (this._inputless_param_names = names);
	}

	//
	// Create spare params on gl nodes
	//
	createSpareParameters() {
		if (this.node.scene().loadingController.isLoading()) {
			return;
		}

		const current_param_names: string[] = this.node.params.spare_names;
		const params_update_options: ParamsUpdateOptions = {};

		for (let param_name of current_param_names) {
			if (this.node.params.has(param_name)) {
				const param = this.node.params.get(param_name);
				if (param) {
					this._raw_input_serialized_by_param_name.set(param_name, param.rawInputSerialized());
					this._default_value_serialized_by_param_name.set(param_name, param.defaultValueSerialized());
					params_update_options.namesToDelete = params_update_options.namesToDelete || [];
					params_update_options.namesToDelete.push(param_name);
				}
			}
		}

		let i = 0;

		for (let connection_point of this.node.io.inputs.namedInputConnectionPoints()) {
			if (connection_point) {
				const isConnected = this.node.io.inputs.input(i) != null;
				const param_name = connection_point.name();
				const param_type: ParamType | null = connection_point.param_type;
				if (param_type) {
					let init_value = connection_point.init_value;

					const last_param_init_value = this._default_value_serialized_by_param_name.get(param_name);
					let default_value_from_name = this.node.paramDefaultValue(param_name);

					if (default_value_from_name != null) {
						init_value = default_value_from_name;
					} else {
						if (last_param_init_value != null) {
							init_value = last_param_init_value;
						} else {
							init_value = connection_point.init_value;
						}
					}
					if (CoreType.isArray(connection_point.init_value)) {
						// if we need to use an init_value from a float to an array
						if (CoreType.isNumber(init_value)) {
							const array = new Array(connection_point.init_value.length) as Number2;
							array.fill(init_value);
							init_value = array;
						}
						// if we need to use an init_value from a array to an array, we need to check their length.
						// if they are different, we need to match them.
						else if (CoreType.isArray(init_value)) {
							// if (init_value.length < connection_point.init_value.length) {
							// }
							// if (init_value.length > connection_point.init_value.length) {
							// }
							if (init_value.length == connection_point.init_value.length) {
								if (last_param_init_value != null) {
									init_value = connection_point.init_value;
								}
							}
						}
					}

					if (init_value != null) {
						params_update_options.toAdd = params_update_options.toAdd || [];
						params_update_options.toAdd.push({
							name: param_name,
							type: param_type,
							// TODO: I should really treat differently init_value and raw_input here
							initValue: ObjectUtils.clone(init_value as any),
							rawInput: ObjectUtils.clone(init_value as any),
							options: {
								spare: true,
								editable: !isConnected,
							},
						});
					}
				}
			}
			i++;
		}
		// if (!this.node.scene.loading_controller.isLoading()) {
		this.node.params.updateParams(params_update_options);

		for (let spare_param of this.node.params.spare) {
			if (!spare_param.parentParam()) {
				const raw_input = this._raw_input_serialized_by_param_name.get(spare_param.name());
				if (raw_input) {
					spare_param.set(raw_input as any);
				}
			}
		}
		// }
	}
}
