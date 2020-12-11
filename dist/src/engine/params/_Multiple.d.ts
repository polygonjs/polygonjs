import { TypedParam } from './_Base';
import { FloatParam } from './Float';
import { ParamType } from '../poly/ParamType';
import { ParamInitValueSerializedTypeMap } from './types/ParamInitValueSerializedTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare abstract class TypedMultipleParam<T extends ParamType> extends TypedParam<T> {
    private _components_contructor;
    protected _components: FloatParam[];
    get components(): FloatParam[];
    get is_numeric(): boolean;
    get is_default(): boolean;
    get raw_input(): ParamInitValueSerializedTypeMap[T];
    get raw_input_serialized(): ParamInitValueSerializedTypeMap[T];
    protected _copy_value(param: TypedMultipleParam<T>): void;
    init_components(): void;
    protected process_computation(): Promise<void>;
    set_value_from_components(): void;
    has_expression(): boolean;
    private compute_components;
    protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[T];
    protected process_raw_input(): void;
}
