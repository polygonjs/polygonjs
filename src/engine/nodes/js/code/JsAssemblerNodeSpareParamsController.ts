import {TypedParam} from '../../../params/_Base';
import {ParamsUpdateOptions} from '../../utils/params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {JsAssemblerControllerType, AssemblerControllerNode} from './Controller';
import {ParamInitValueSerialized} from '../../../params/types/ParamInitValueSerialized';
import {setUnion, setToArray, setIntersection} from '../../../../core/SetUtils';
import {arrayToSet} from '../../../../core/ArrayUtils';
import {mapGroupBy} from '../../../../core/MapUtils';
import {JsParamConfig} from './utils/JsParamConfig';
import {BaseJsShaderAssembler} from './assemblers/_Base';

const _currentParamNames: Set<string> = new Set();
const _spareParamNamesToAdd: Set<string> = new Set();
const _spareParamNamesToRemove: Set<string> = new Set();
const _spareParamsWithSameNameAsParams: Set<string> = new Set();
const _tmp: Set<string> = new Set();

const DEBUG = false;
function _paramMatchesParamConfig<T extends ParamType>(param: TypedParam<T>, paramConfig: JsParamConfig<T>) {
	if (param.type() != paramConfig.type()) {
		if (DEBUG) {
			console.log(`${param.name()}: type is different to paramConfig's`, param.type(), paramConfig.type());
		}
		return false;
	}
	if (param.name() != paramConfig.name()) {
		if (DEBUG) {
			console.log(`${param.name()}: name is different to paramConfig's`, param.name(), paramConfig.name());
		}
		return false;
	}
	if (!param.isDefaultValueEqual(paramConfig.defaultValue())) {
		if (DEBUG) {
			console.log(
				`${param.name()}: defaultValue is different to paramConfig's`,
				param.defaultValue(),
				paramConfig.defaultValue()
			);
		}
		return false;
	}
	// if (!param.isRawInputEqual(paramConfig.defaultValue())) {
	// 	if (debug) {
	// 		console.log(
	// 			`${param.name()}: rawInput is different to paramConfig's`,
	// 			param.rawInput(),
	// 			paramConfig.defaultValue()
	// 		);
	// 	}
	// 	return false;
	// }

	return true;
}

/*
Create spare params on mat nodes
*/
export class JsAssemblerNodeSpareParamsController {
	// private _deletedParamsData: Map<string, ParamJsonExporterData<ParamType>> = new Map();
	// private _createdSpareParamNames: Set<string> = new Set();
	private _raw_input_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	private _init_value_serialized_by_param_name: Map<string, ParamInitValueSerialized> = new Map();
	constructor(
		private _controller: JsAssemblerControllerType,
		private _node: AssemblerControllerNode<BaseJsShaderAssembler>
	) {}
	get assembler() {
		return this._controller.assembler;
	}

	// private _createdSpareParams(){
	// 	return this._node.params.spare;
	// }

	createSpareParameters() {
		// const current_spare_param_names: string[] = this.node.params.spare_names;
		const paramsUpdateOptions: ParamsUpdateOptions = {};
		const paramConfigs = this.assembler.param_configs();
		const paramConfigsByName = mapGroupBy<JsParamConfig<ParamType>, string>(paramConfigs, (c) => c.name());
		const assembler_param_names = paramConfigs.map((c) => c.name());
		arrayToSet(assembler_param_names, _spareParamNamesToAdd);
		const validation_result = this._validateNames(_spareParamNamesToAdd);
		if (validation_result == false) {
			return;
		}

		// spare_param_names_to_remove is composed of previously created params, but also spare params with the same name, which may be created when loading the scene
		// console.log('- 1', this._createSpareParams(), spare_param_names_to_add);
		const currentSpareParams = this._node.params.spare;
		const currentSpareParamNames: string[] = currentSpareParams.map((p) => p.name());

		setUnion(arrayToSet(currentSpareParamNames, _tmp), _spareParamNamesToAdd, _spareParamNamesToRemove);
		// but if the param type has not changed, we do not need to remove it, nor add it
		// this._createdSpareParamNames.forEach((paramName) => {
		// 	const currentParamType = this._node.params.get(paramName)?.type();
		// 	const paramConfigsWithName = paramConfigsByName.get(paramName);
		// 	if (paramConfigsWithName) {
		// 		const firstParamConfig = paramConfigsWithName[0];
		// 		if (firstParamConfig) {
		// 			const expectedParamType = firstParamConfig.type();

		// 			if (currentParamType == expectedParamType) {
		// 				spare_param_names_to_remove.delete(paramName);
		// 				spare_param_names_to_add.delete(paramName);
		// 			}
		// 		}
		// 	}
		// });

		for (const currentSpareParam of currentSpareParams) {
			const paramConfigsWithName = paramConfigsByName.get(currentSpareParam.name());
			if (paramConfigsWithName) {
				const firstParamConfig = paramConfigsWithName[0];
				if (firstParamConfig) {
					if (_paramMatchesParamConfig(currentSpareParam, firstParamConfig)) {
						_spareParamNamesToRemove.delete(currentSpareParam.name());
						_spareParamNamesToAdd.delete(currentSpareParam.name());
					}
				}
			}
		}

		// keep track of raw_inputs so we can restore them
		_spareParamNamesToRemove.forEach((param_name) => {
			// store the param data, in case it gets recreated later
			// this allows expressions to be kept in memory
			const param = this._node.params.get(param_name);
			if (param && !param.parentParam()) {
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
		for (const paramConfig of paramConfigs) {
			if (_spareParamNamesToAdd.has(paramConfig.name())) {
				const type = paramConfig.type();
				// const config_options = ObjectUtils.clone(paramConfig.paramOptions());
				const options = this.assembler.spareParamsOptions({type});
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

				if (type != ParamType.BUTTON) {
					paramsUpdateOptions.toAdd = paramsUpdateOptions.toAdd || [];
					paramsUpdateOptions.toAdd.push({
						name: paramConfig.name(),
						type,
						initValue: init_value as any,
						rawInput: raw_input as any,
						options,
					});
				}
			}
		}

		this._node.params.updateParams(paramsUpdateOptions);

		for (const paramConfig of paramConfigs) {
			paramConfig.applyToNode(this._node);
		}
	}

	private _validateNames(spareParamNamesToAdd: Set<string>): boolean {
		// check that param_names_to_add does not include any currently existing param names (that are not spare)

		arrayToSet(this._node.params.non_spare_names, _currentParamNames);
		setIntersection(spareParamNamesToAdd, _currentParamNames, _spareParamsWithSameNameAsParams);
		if (_spareParamsWithSameNameAsParams.size > 0) {
			const error_message = `${this._node.path()} attempts to create spare params called '${setToArray(
				_spareParamsWithSameNameAsParams,
				[]
			).join(', ')}' with same name as params`;
			this._node.states.error.set(error_message);
			return false;
		}
		return true;
	}
}
