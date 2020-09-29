import {NodeContext} from '../../engine/poly/NodeContext';
import {ParamsInitData} from '../../engine/nodes/utils/io/IOController';
import {ParamType} from '../../engine/poly/ParamType';
import {ParamValuesTypeMap} from '../../engine/params/types/ParamValuesTypeMap';
import {ParamInitValueSerializedTypeMap} from '../../engine/params/types/ParamInitValueSerializedTypeMap';
import lodash_isBoolean from 'lodash/isBoolean';
import lodash_isNumber from 'lodash/isNumber';
import lodash_isString from 'lodash/isString';
import lodash_isArray from 'lodash/isArray';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {StatesController} from '../../engine/nodes/utils/StatesController';
import {TypedPathParamValue} from '../Walker';
import {BaseNodeType} from '../../engine/nodes/_Base';

type DefaultOperationParam<T extends ParamType> = ParamValuesTypeMap[T];
export type DefaultOperationParams = Dictionary<DefaultOperationParam<ParamType>>;
type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];

export const OPERATIONS_STACK_NODE_TYPE: Readonly<string> = 'operations_stack';

export class BaseOperation {
	static type(): string {
		throw 'type to be overriden';
	}
	type() {
		const c = this.constructor as typeof BaseOperation;
		return c.type();
	}
	static context(): NodeContext {
		console.error('operation has no node_context', this);
		throw 'context requires override';
	}
	context(): NodeContext {
		const c = this.constructor as typeof BaseOperation;
		return c.context();
	}

	static readonly DEFAULT_PARAMS: DefaultOperationParams = {};

	constructor(protected states?: StatesController) {}

	cook(input_contents: any[], params: object): any {}
}

export class BaseOperationContainer {
	protected params: DefaultOperationParams = {};
	private _path_params: TypedPathParamValue[] | undefined;

	constructor(protected operation: BaseOperation, init_params: ParamsInitData) {
		this._apply_default_params();
		this._apply_init_params(init_params);
	}

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

	protected _inputs: BaseOperationContainer[] = [];
	set_input(index: number, input: BaseOperationContainer) {
		this._inputs[index] = input;
	}

	cook(input_contents: any[]) {
		return this.operation.cook(input_contents, this.params);
	}
}
