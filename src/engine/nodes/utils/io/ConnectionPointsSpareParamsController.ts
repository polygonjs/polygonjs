import {Number2} from '../../../../types/GlobalTypes';
import {
	ConnectionPointTypeMap,
	ConnectionPointEnumMap,
	paramTypeToConnectionPointTypeMap,
	createConnectionPoint,
} from './connections/ConnectionMap';
import {ParamType} from '../../../poly/ParamType';
import {ParamsUpdateOptions} from '../params/ParamsController';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {CoreType} from '../../../../core/Type';
import {objectClone} from '../../../../core/ObjectUtils';

/*
GlNodeSpareParamsController creates spare params from inputs on gl nodes
*/
export class ConnectionPointsSpareParamsController<NC extends NodeContext> {
	// private _allow_inputs_created_from_params: boolean = true;
	private _inputlessParamNames: string[] | undefined;
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
		const connectionTypeMap = paramTypeToConnectionPointTypeMap(this._context);
		if (!connectionTypeMap) {
			return;
		}

		const connectionPoints: ConnectionPointTypeMap[NC][] = [];
		for (const paramName of this.node.params.names) {
			let addInput = true;
			if (
				this._inputlessParamNames &&
				this._inputlessParamNames.length > 0 &&
				this._inputlessParamNames.includes(paramName)
			) {
				addInput = false;
			}
			if (addInput) {
				if (this.node.params.has(paramName)) {
					const param = this.node.params.get(paramName);
					if (param && !param.parentParam()) {
						const connectionType = connectionTypeMap[param.type()] as ConnectionPointEnumMap[NC];
						if (connectionType) {
							const connectionPoint = createConnectionPoint(
								this._context,
								param.name(),
								connectionType
							) as ConnectionPointTypeMap[NC];
							if (connectionPoint) {
								connectionPoints.push(connectionPoint);
							}
						}
					}
				}
			}
		}
		this.node.io.inputs.setNamedInputConnectionPoints(connectionPoints);
	}

	setInputlessParamNames(names: string[]) {
		return (this._inputlessParamNames = names);
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

		for (const param_name of current_param_names) {
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

		const inputConnectionPoints = this.node.io.inputs.namedInputConnectionPoints();
		if (inputConnectionPoints) {
			let i = 0;
			for (const connection_point of inputConnectionPoints) {
				if (connection_point) {
					const isConnected = this.node.io.inputs.input(i) != null;
					const param_name = connection_point.name();
					const paramType: ParamType | null = connection_point.param_type;
					if (paramType) {
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

						if (init_value != null && paramType != ParamType.BUTTON) {
							params_update_options.toAdd = params_update_options.toAdd || [];
							params_update_options.toAdd.push({
								name: param_name,
								type: paramType,
								// TODO: I should really treat differently init_value and raw_input here
								initValue: objectClone(init_value as any),
								rawInput: objectClone(init_value as any),
								options: {
									spare: true,
									editable: !isConnected,
									// computeOnDirty should be false for PARAM_PATH
									// so that js/setParam and js/getParam can link to a parameter
									// without having their parent node actor being recooked
									computeOnDirty: paramType != ParamType.PARAM_PATH,
									// dependentOnFoundParam should be false for PARAM_PATH
									// so that js/setParam and js/getParam can link to a parameter
									// without having their parent node actor being recooked
									dependentOnFoundParam: false,
									// dependentOnFoundNode: true,
								},
							});
						}
					}
				}
				i++;
			}
		}

		// if (!this.node.scene.loading_controller.isLoading()) {
		this.node.params.updateParams(params_update_options);

		for (const spare_param of this.node.params.spare) {
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
