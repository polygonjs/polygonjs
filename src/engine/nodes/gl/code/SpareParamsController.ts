import {ObjectUtils} from '../../../../core/ObjectUtils';
import {JsonExportDispatcher} from '../../../io/json/export/Dispatcher';
import {ParamJsonExporterData} from '../../utils/io/IOController';
import {ParamsUpdateOptions} from '../../utils/params/ParamsController';
import {ParamOptions} from '../../../params/utils/OptionsController';
import {ParamType} from '../../../poly/ParamType';
import {GlAssemblerControllerType, AssemblerControllerNode} from './Controller';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';
import {ArrayUtils} from '../../../../core/ArrayUtils';

/*
Create spare params on mat nodes
*/
export class AssemblerNodeSpareParamsController {
	private _deleted_params_data: Map<string, ParamJsonExporterData<ParamType>> = new Map();
	private _created_spare_param_names: string[] = [];
	private _raw_input_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	private _init_value_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	constructor(private _controller: GlAssemblerControllerType, private _node: AssemblerControllerNode) {}
	get assembler() {
		return this._controller.assembler;
	}

	createSpareParameters() {
		// const current_spare_param_names: string[] = this.node.params.spare_names;
		const params_update_options: ParamsUpdateOptions = {};
		const param_configs = this.assembler.param_configs();
		const assembler_param_names = param_configs.map((c) => c.name());
		const spare_param_names_to_add = ObjectUtils.clone(assembler_param_names);
		const validation_result = this._validateNames(spare_param_names_to_add);
		if (validation_result == false) {
			return;
		}

		// spare_param_names_to_remove is composed of previously created params, but also spare params with the same name, which may be created when loading the scene
		const spare_param_names_to_remove = ObjectUtils.clone(this._created_spare_param_names).concat(
			spare_param_names_to_add
		);

		// keep track of raw_inputs so we can restore them
		spare_param_names_to_remove.forEach((param_name) => {
			// store the param data, in case it gets recreated later
			// this allows expressions to be kept in memory
			const param = this._node.params.get(param_name);
			if (param) {
				this._raw_input_serialized_by_param_name.set(param.name(), param.rawInputSerialized());
				this._init_value_serialized_by_param_name.set(param.name(), param.defaultValueSerialized());
				const param_exporter = JsonExportDispatcher.dispatch_param(param);
				if (param_exporter.required()) {
					const params_data = param_exporter.data();
					this._deleted_params_data.set(param.name(), params_data);
				}
			}

			params_update_options.namesToDelete = params_update_options.namesToDelete || [];
			params_update_options.namesToDelete.push(param_name);
		});

		// this.within_param_folder('spare_params', () => {
		for (let param_config of param_configs) {
			if (spare_param_names_to_add.indexOf(param_config.name()) >= 0) {
				const config_options = ObjectUtils.clone(param_config.param_options);
				const default_options: ParamOptions = {
					spare: true,
					computeOnDirty: true,
					cook: false, // it should update the uniforms only via its callback
					// important for texture nodes
					// that compute after being found by the nodepath param
					dependentOnFoundNode: true,
				};
				const options = ObjectUtils.merge(config_options, default_options);

				// set init_value and raw_input to the previous param's
				let init_value = this._init_value_serialized_by_param_name.get(param_config.name());
				if (init_value == null) {
					init_value = param_config.default_value as any;
				}
				let raw_input = this._raw_input_serialized_by_param_name.get(param_config.name());
				if (raw_input == null) {
					raw_input = param_config.default_value as any;
				}

				params_update_options.toAdd = params_update_options.toAdd || [];
				params_update_options.toAdd.push({
					name: param_config.name(),
					type: param_config.type(),
					init_value: init_value as any,
					raw_input: raw_input as any,
					options: options,
				});
			}
		}

		this._node.params.updateParams(params_update_options);
		this._created_spare_param_names = params_update_options.toAdd?.map((o) => o.name) || [];

		// We force the param configs to run their callbacks to ensure that the uniforms are up to date.
		// This seems better than running the parameter options callback, since it would check
		// if the scene is loading or the node cooking, which is unnecessary for uniforms
		for (let param_config of param_configs) {
			const param = this._node.params.get(param_config.name());
			if (param) {
				param_config.execute_callback(this._node, param);

				// we also have a special case for operator path,
				// since they would not have found their node at load time
				if (param.type() == ParamType.NODE_PATH) {
					setTimeout(async () => {
						if (param.isDirty()) {
							await param.compute();
						}
						param.options.executeCallback();
					}, 200);
				}
			}
		}
	}

	// TODO: handle the case where a param created by user already exists.
	// we may then change the name of the new spare param.
	private _validateNames(spare_param_names_to_add: string[]): boolean {
		// check that param_names_to_add does not include any currently existing param names (that are not spare)
		const current_param_names = ObjectUtils.clone(this._node.params.non_spare_names);
		const spare_params_with_same_name_as_params = ArrayUtils.intersection(
			spare_param_names_to_add,
			current_param_names
		);
		if (spare_params_with_same_name_as_params.length > 0) {
			const error_message = `${this._node.path()} attempts to create spare params called '${spare_params_with_same_name_as_params.join(
				', '
			)}' with same name as params`;
			this._node.states.error.set(error_message);
			return false;
		}
		return true;
	}
}
