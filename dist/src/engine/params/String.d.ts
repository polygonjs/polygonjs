import { TypedParam } from './_Base';
import { ParamType } from '../poly/ParamType';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
export declare class StringParam extends TypedParam<ParamType.STRING> {
    static type(): ParamType;
    get default_value_serialized(): string;
    protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.STRING]): string;
    get raw_input_serialized(): string;
    get value_serialized(): string;
    protected _copy_value(param: StringParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.STRING], raw_input2: ParamInitValuesTypeMap[ParamType.STRING]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.STRING], val2: ParamValuesTypeMap[ParamType.STRING]): boolean;
    get is_default(): boolean;
    convert(raw_val: any): string;
    get raw_input(): string;
    protected process_raw_input(): void;
    protected process_computation(): Promise<void>;
    private _value_elements;
}
