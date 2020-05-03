import { TypedParam } from './_Base';
import { BaseNodeType } from '../nodes/_Base';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
import { NodeContext, BaseNodeByContextMap, ChildrenNodeMapByContextMap } from '../poly/NodeContext';
export declare class OperatorPathParam extends TypedParam<ParamType.OPERATOR_PATH> {
    private _found_node;
    private _found_node_with_expected_type;
    static type(): ParamType;
    get default_value_serialized(): string;
    get raw_input_serialized(): string;
    get value_serialized(): string;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH], raw_input2: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.OPERATOR_PATH], val2: ParamValuesTypeMap[ParamType.OPERATOR_PATH]): boolean;
    get is_default(): boolean;
    protected process_raw_input(): void;
    protected process_computation(): Promise<void>;
    found_node(): BaseNodeType | null;
    found_node_with_context<N extends NodeContext>(context: N): BaseNodeByContextMap[N] | undefined;
    found_node_with_context_and_type<N extends NodeContext, K extends keyof ChildrenNodeMapByContextMap[N]>(context: N, type: K): ChildrenNodeMapByContextMap[N][K] | undefined;
    found_node_with_expected_type(): BaseNodeType | null;
    private _expected_context;
    private _is_node_expected_context;
    private _expected_type;
    private _is_node_expected_type;
}
