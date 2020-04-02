import { BaseParamType } from '../../../params/_Base';
import { ParamType } from '../../../poly/ParamType';
import { ParamInitValueSerializedTypeMap } from '../../../params/types/ParamInitValueSerializedTypeMap';
import { ParamOptions } from '../../../params/utils/OptionsController';
declare type OverridenOptions = Dictionary<string>;
export declare type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];
export interface ComplexParamJsonExporterData<T extends ParamType> {
    type?: T;
    default_value?: ParamInitValueSerializedTypeMap[T];
    raw_input?: ParamInitValueSerializedTypeMap[T];
    options?: ParamOptions;
    overriden_options?: OverridenOptions;
}
export declare type ParamJsonExporterData<T extends ParamType> = SimpleParamJsonExporterData<T> | ComplexParamJsonExporterData<T>;
export declare type ParamJsonExporterDataByName = Dictionary<ParamJsonExporterData<ParamType>>;
export declare class ParamJsonExporter<T extends BaseParamType> {
    protected _param: T;
    protected _complex_data: ComplexParamJsonExporterData<ParamType>;
    constructor(_param: T);
    get required(): boolean;
    data(): string | number | boolean | StringOrNumber2 | StringOrNumber3 | StringOrNumber4 | import("../../../params/ramp/RampValue").RampValueJson | ComplexParamJsonExporterData<ParamType> | null;
    private _data_simple;
    private _data_complex;
    protected _require_data_complex(): boolean;
    protected add_main(): void;
}
export {};
