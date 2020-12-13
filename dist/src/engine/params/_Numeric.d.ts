import { TypedParam } from './_Base';
import { ParamType } from '../poly/ParamType';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare abstract class TypedNumericParam<T extends ParamType> extends TypedParam<T> {
    get is_numeric(): boolean;
    get is_default(): boolean;
    protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[T];
    protected process_raw_input(): void;
    protected process_computation(): Promise<void>;
    private _update_value;
}
