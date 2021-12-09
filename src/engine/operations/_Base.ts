import {NodeContext} from '../../engine/poly/NodeContext';
import {ParamType} from '../../engine/poly/ParamType';
import {ParamValuesTypeMap} from '../../engine/params/types/ParamValuesTypeMap';
import {StatesController} from '../../engine/nodes/utils/StatesController';
import {PolyScene} from '../../engine/scene/PolyScene';
import {InputCloneMode} from '../../engine/poly/InputCloneMode';
import {PolyDictionary} from '../../types/GlobalTypes';
import {BaseNodeType} from '../nodes/_Base';
import {CoreType} from '../../core/Type';
import {TypedNodePathParamValue, TypedParamPathParamValue} from '../../core/Walker';
import {Vector3} from 'three/src/math/Vector3';
import {SimpleParamJsonExporterData} from '../nodes/utils/io/IOController';

export interface ConvertExportParamDataParams {
	paramName: string;
	paramData: SimpleParamJsonExporterData<ParamType>;
	params: DefaultOperationParams;
}

export type DefaultOperationParam<T extends ParamType> = ParamValuesTypeMap[T];
export type DefaultOperationParams = PolyDictionary<DefaultOperationParam<ParamType>>;

export const OPERATIONS_COMPOSER_NODE_TYPE: Readonly<string> = 'operationsComposer';

export class BaseOperation<NC extends NodeContext> {
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
	static readonly INPUT_CLONED_STATE: InputCloneMode | InputCloneMode[] = [];

	constructor(protected _scene: PolyScene, protected states?: StatesController<NC>, protected _node?: BaseNodeType) {}
	scene() {
		return this._scene;
	}
	cook(input_contents: any[], params: object): any {}

	convertExportParamData(options: ConvertExportParamDataParams) {
		const {params, paramName, paramData} = options;
		const default_param = params[paramName];
		if (CoreType.isBoolean(paramData)) {
			return paramData;
		}
		if (CoreType.isNumber(paramData)) {
			if (CoreType.isBoolean(default_param)) {
				// if we receive 0, it may be for a boolean param,
				// so if the default is a boolean, we convert
				return paramData >= 1 ? true : false;
			} else {
				return paramData;
			}
		}
		if (CoreType.isString(paramData)) {
			if (default_param) {
				if (default_param instanceof TypedNodePathParamValue) {
					return default_param.set_path(paramData);
				}
				if (default_param instanceof TypedParamPathParamValue) {
					return default_param.set_path(paramData);
				}
			}
			return paramData;
		}
		if (CoreType.isArray(paramData)) {
			(params[paramName] as Vector3).fromArray(paramData as number[]);
		}
	}
}
