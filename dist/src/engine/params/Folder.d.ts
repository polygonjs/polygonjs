import { TypedParam } from './_Base';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class FolderParam extends TypedParam<ParamType.FOLDER> {
    static type(): ParamType;
    get default_value_serialized(): null;
    get raw_input_serialized(): null;
    get value_serialized(): null;
    protected _copy_value(param: FolderParam): void;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.FOLDER], raw_input2: ParamInitValuesTypeMap[ParamType.FOLDER]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.FOLDER], val2: ParamValuesTypeMap[ParamType.FOLDER]): boolean;
}
