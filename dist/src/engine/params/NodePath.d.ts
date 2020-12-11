import { TypedParam } from './_Base';
import { BaseNodeType } from '../nodes/_Base';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
import { DecomposedPath } from '../../core/DecomposedPath';
export declare const NODE_PATH_DEFAULT: {
    NODE: {
        UV: string;
        ENV_MAP: string;
    };
};
export declare class NodePathParam extends TypedParam<ParamType.NODE_PATH> {
    private _found_node;
    readonly decomposed_path: DecomposedPath;
    static type(): ParamType;
    initialize_param(): void;
    get default_value_serialized(): string;
    get raw_input_serialized(): string;
    get value_serialized(): string;
    protected _copy_value(param: NodePathParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.NODE_PATH], raw_input2: ParamInitValuesTypeMap[ParamType.NODE_PATH]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.NODE_PATH], val2: ParamValuesTypeMap[ParamType.NODE_PATH]): boolean;
    get is_default(): boolean;
    protected process_raw_input(): void;
    protected process_computation(): Promise<void>;
    private find_target;
    notify_path_rebuild_required(node: BaseNodeType): void;
    notify_target_param_owner_params_updated(node: BaseNodeType): void;
}
