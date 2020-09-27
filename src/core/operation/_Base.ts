import {NodeContext} from '../../engine/poly/NodeContext';
import {ParamsInitData} from '../../engine/nodes/utils/io/IOController';
import {ParamType} from '../../engine/poly/ParamType';
import {ParamValuesTypeMap} from '../../engine/params/types/ParamValuesTypeMap';
import {ParamInitValueSerializedTypeMap} from '../../engine/params/types/ParamInitValueSerializedTypeMap';
import lodash_isNumber from 'lodash/isNumber';
import lodash_isString from 'lodash/isString';
import lodash_isArray from 'lodash/isArray';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

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

	cook(input_contents: any[], params: object): any {}
}

export class BaseOperationContainer {
	protected params: DefaultOperationParams = {};
	constructor(protected operation: BaseOperation, init_params: ParamsInitData) {
		this._apply_default_params();
		this._apply_init_params(init_params);
	}

	private _apply_default_params() {
		const default_params = (this.operation.constructor as typeof BaseOperation).DEFAULT_PARAMS;
		const param_names = Object.keys(default_params);
		for (let param_name of param_names) {
			const param_data = default_params[param_name];
			const clone_param_data = this._convert_param_data(param_data);
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

	private _convert_param_data(param_data: DefaultOperationParam<ParamType>) {
		if (lodash_isNumber(param_data) || lodash_isString(param_data)) {
			return param_data;
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
		if (lodash_isNumber(param_data) || lodash_isString(param_data)) {
			return param_data;
		}
		if (lodash_isArray(param_data)) {
			(this.params[param_name] as Vector3).fromArray(param_data as number[]);
		}
	}

	cook(input_contents: any[]) {
		return this.operation.cook(input_contents, this.params);
	}
}
