import { TypedParam } from './_Base';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class ButtonParam extends TypedParam<ParamType.BUTTON> {
    static type(): ParamType;
    get default_value_serialized(): null;
    get raw_input_serialized(): null;
    get value_serialized(): null;
    protected _copy_value(param: ButtonParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.BUTTON], raw_input2: ParamInitValuesTypeMap[ParamType.BUTTON]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.BUTTON], val2: ParamValuesTypeMap[ParamType.BUTTON]): boolean;
    press_button(): Promise<void>;
}
