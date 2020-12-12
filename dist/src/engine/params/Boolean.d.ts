import { TypedNumericParam } from './_Numeric';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class BooleanParam extends TypedNumericParam<ParamType.BOOLEAN> {
    static type(): ParamType;
    get default_value_serialized(): string | boolean;
    get raw_input_serialized(): string | number | boolean;
    get value_serialized(): boolean;
    protected _copy_value(param: BooleanParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.BOOLEAN], raw_input2: ParamInitValuesTypeMap[ParamType.BOOLEAN]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.BOOLEAN], val2: ParamValuesTypeMap[ParamType.BOOLEAN]): boolean;
    convert(raw_val: ParamInitValuesTypeMap[ParamType.BOOLEAN]): boolean | null;
}
