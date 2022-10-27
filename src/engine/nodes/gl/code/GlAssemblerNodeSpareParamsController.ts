import {ParamsUpdateOptions} from '../../utils/params/ParamsController';
import {ParamOptions} from '../../../params/utils/OptionsController';
import {ParamType} from '../../../poly/ParamType';
import {GlAssemblerControllerType, AssemblerControllerNode} from './Controller';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';
import {SetUtils} from '../../../../core/SetUtils';
import {MapUtils} from '../../../../core/MapUtils';
import {GlParamConfig} from './utils/GLParamConfig';

/*
Create spare params on mat nodes
*/
export class GlAssemblerNodeSpareParamsController {
	// private _deletedParamsData: Map<string, ParamJsonExporterData<ParamType>> = new Map();
	private _createdSpareParamNames: Set<string> = new Set();
	private _raw_input_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	private _init_value_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	constructor(private _controller: GlAssemblerControllerType, private _node: AssemblerControllerNode) {}
	get assembler() {
		return this._controller.assembler;
	}

	createSpareParameters() {
		// const current_spare_param_names: string[] = this.node.params.spare_names;
		const paramsUpdateOptions: ParamsUpdateOptions = {};
		const paramConfigs = this.assembler.param_configs();
		const paramConfigsByName = MapUtils.groupBy<GlParamConfig<ParamType>, string>(paramConfigs, (c) => c.name());
		const assembler_param_names = paramConfigs.map((c) => c.name());
		const spare_param_names_to_add = SetUtils.fromArray(assembler_param_names);
		const validation_result = this._validateNames(spare_param_names_to_add);
		if (validation_result == false) {
			return;
		}

		// spare_param_names_to_remove is composed of previously created params, but also spare params with the same name, which may be created when loading the scene
		const spare_param_names_to_remove = SetUtils.union(this._createdSpareParamNames, spare_param_names_to_add);
		// but if the param type has not changed, we do not need to remove it, nor add it
		this._createdSpareParamNames.forEach((paramName) => {
			const currentParamType = this._node.params.get(paramName)?.type();
			const paramConfigsWithName = paramConfigsByName.get(paramName);
			if (paramConfigsWithName) {
				const firstParamConfig = paramConfigsWithName[0];
				if (firstParamConfig) {
					const expectedParamType = firstParamConfig.type();
					if (currentParamType == expectedParamType) {
						spare_param_names_to_remove.delete(paramName);
						spare_param_names_to_add.delete(paramName);
					}
				}
			}
		});

		// keep track of raw_inputs so we can restore them
		spare_param_names_to_remove.forEach((param_name) => {
			// store the param data, in case it gets recreated later
			// this allows expressions to be kept in memory
			const param = this._node.params.get(param_name);
			if (param) {
				this._raw_input_serialized_by_param_name.set(param.name(), param.rawInputSerialized());
				this._init_value_serialized_by_param_name.set(param.name(), param.defaultValueSerialized());
				// const param_exporter = JsonExportDispatcher.dispatch_param(param);
				// if (param_exporter.required()) {
				// 	// const params_data = param_exporter.data();
				// 	// this._deletedParamsData.set(param.name(), params_data);
				// }
				paramsUpdateOptions.namesToDelete = paramsUpdateOptions.namesToDelete || [];
				paramsUpdateOptions.namesToDelete.push(param_name);
			}
		});

		// this.within_param_folder('spare_params', () => {
		for (let paramConfig of paramConfigs) {
			if (spare_param_names_to_add.has(paramConfig.name())) {
				// const config_options = ObjectUtils.clone(paramConfig.paramOptions());
				const options: ParamOptions = {
					spare: true,
					computeOnDirty: true,
					cook: false, // it should update the uniforms only via its callback
					// important for texture nodes
					// that compute after being found by the nodepath param
					dependentOnFoundNode: true,
				};
				// const options = ObjectUtils.merge(config_options, default_options);

				// set init_value and raw_input to the previous param's
				let init_value = this._init_value_serialized_by_param_name.get(paramConfig.name());
				if (init_value == null) {
					init_value = paramConfig.defaultValue() as any;
				}
				let raw_input = this._raw_input_serialized_by_param_name.get(paramConfig.name());
				if (raw_input == null) {
					raw_input = paramConfig.defaultValue() as any;
				}

				paramsUpdateOptions.toAdd = paramsUpdateOptions.toAdd || [];
				paramsUpdateOptions.toAdd.push({
					name: paramConfig.name(),
					type: paramConfig.type(),
					initValue: init_value as any,
					rawInput: raw_input as any,
					options: options,
				});
			}
		}

		this._node.params.updateParams(paramsUpdateOptions);
		this._createdSpareParamNames = SetUtils.fromArray(paramConfigs.map((c) => c.name()));

		for (let paramConfig of paramConfigs) {
			paramConfig.applyToNode(this._node);
		}
	}

	private _validateNames(spare_param_names_to_add: Set<string>): boolean {
		// check that param_names_to_add does not include any currently existing param names (that are not spare)
		const currentParamNames = SetUtils.fromArray(this._node.params.non_spare_names);
		const spareParamsWithSameNameAsParams = SetUtils.intersection(spare_param_names_to_add, currentParamNames);
		if (spareParamsWithSameNameAsParams.size > 0) {
			const error_message = `${this._node.path()} attempts to create spare params called '${SetUtils.toArray(
				spareParamsWithSameNameAsParams
			).join(', ')}' with same name as params`;
			this._node.states.error.set(error_message);
			return false;
		}
		return true;
	}
}
