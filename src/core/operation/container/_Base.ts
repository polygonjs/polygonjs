import {ParamsInitData} from '../../../engine/nodes/utils/io/IOController';
import {ParamType} from '../../../engine/poly/ParamType';
import lodash_isBoolean from 'lodash/isBoolean';
import lodash_isNumber from 'lodash/isNumber';
import lodash_isString from 'lodash/isString';
import lodash_isArray from 'lodash/isArray';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {TypedPathParamValue} from '../../Walker';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {BaseOperation, DefaultOperationParams, DefaultOperationParam} from '../_Base';
import {ParamInitValueSerializedTypeMap} from '../../../engine/params/types/ParamInitValueSerializedTypeMap';
import {InputsController} from './utils/InputsController';

type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];

export class BaseOperationContainer {
	protected params: DefaultOperationParams = {};
	private _path_params: TypedPathParamValue[] | undefined;

	constructor(protected operation: BaseOperation, protected name: string, init_params: ParamsInitData) {
		this._apply_default_params();
		this._apply_init_params(init_params);
		this._init_cloned_states();
	}

	//
	//
	// PATH PARAMS
	//
	//
	path_param_resolve_required() {
		return this._path_params != null;
	}
	resolve_path_params(node_start: BaseNodeType) {
		if (!this._path_params) {
			return;
		}
		for (let path_param of this._path_params) {
			path_param.resolve(node_start);
		}
	}

	//
	//
	// PARAM VALUES CONVERSION
	//
	//
	private _apply_default_params() {
		const default_params = (this.operation.constructor as typeof BaseOperation).DEFAULT_PARAMS;
		const param_names = Object.keys(default_params);
		for (let param_name of param_names) {
			const param_data = default_params[param_name];
			const clone_param_data = this._convert_param_data(param_name, param_data);
			if (clone_param_data != undefined) {
				this.params[param_name] = clone_param_data;
			}
		}
	}

	private _apply_init_params(init_params: ParamsInitData) {
		const param_names = Object.keys(init_params);
		for (let param_name of param_names) {
			const param_data = init_params[param_name];
			if (param_data.simple_data) {
				const simple_data = param_data.simple_data;
				const clone_param_data = this._convert_export_param_data(param_name, simple_data);
				if (clone_param_data != undefined) {
					this.params[param_name] = clone_param_data;
				}
			}
		}
	}

	private _convert_param_data(param_name: string, param_data: DefaultOperationParam<ParamType>) {
		if (lodash_isNumber(param_data) || lodash_isBoolean(param_data) || lodash_isString(param_data)) {
			return param_data;
		}
		if (param_data instanceof TypedPathParamValue) {
			const cloned = param_data.clone();
			if (!this._path_params) {
				this._path_params = [];
			}
			this._path_params.push(cloned);
			return cloned;
		}
		if (
			param_data instanceof Color ||
			param_data instanceof Vector2 ||
			param_data instanceof Vector3 ||
			param_data instanceof Vector4
		) {
			return param_data.clone();
		}
	}

	private _convert_export_param_data(param_name: string, param_data: SimpleParamJsonExporterData<ParamType>) {
		if (lodash_isNumber(param_data) || lodash_isBoolean(param_data)) {
			return param_data;
		}
		if (lodash_isString(param_data)) {
			const default_param = this.params[param_name];
			if (default_param && default_param instanceof TypedPathParamValue) {
				return default_param.set_path(param_data);
			} else {
				return param_data;
			}
		}
		if (lodash_isArray(param_data)) {
			(this.params[param_name] as Vector3).fromArray(param_data as number[]);
		}
	}

	//
	//
	// INPUTS
	//
	//
	protected _inputs: BaseOperationContainer[] | undefined;
	set_input(index: number, input: BaseOperationContainer) {
		this._inputs = this._inputs || [];
		this._inputs[index] = input;
	}
	inputs_count() {
		if (this._inputs) {
			return this._inputs.length;
		} else {
			return 0;
		}
	}

	private _inputs_controller: InputsController | undefined;
	protected inputs_controller() {
		return (this._inputs_controller = this._inputs_controller || new InputsController(this));
	}
	private _init_cloned_states() {
		const default_cloned_states = (this.operation.constructor as typeof BaseOperation).INPUT_CLONED_STATE;
		this.inputs_controller().init_inputs_cloned_state(default_cloned_states);
	}
	input_clone_required(index: number): boolean {
		if (!this._inputs_controller) {
			return true;
		}
		return this._inputs_controller.clone_required(index);
	}
	override_input_clone_state(state: boolean) {
		this.inputs_controller().override_cloned_state(state);
	}

	//
	//
	// COOK
	//
	//
	cook(input_contents: any[]) {
		return this.operation.cook(input_contents, this.params);
	}
}
