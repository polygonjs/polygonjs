import { TypedParam } from './_Base';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class SeparatorParam extends TypedParam<ParamType.SEPARATOR> {
    static type(): ParamType;
    get default_value_serialized(): null;
    get raw_input_serialized(): null;
    get value_serialized(): null;
    protected _copy_value(param: SeparatorParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.SEPARATOR], raw_input2: ParamInitValuesTypeMap[ParamType.SEPARATOR]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.SEPARATOR], val2: ParamValuesTypeMap[ParamType.SEPARATOR]): boolean;
}
