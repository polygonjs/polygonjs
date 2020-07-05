import { BaseParamType } from '../../../params/_Base';
import { ComplexParamJsonExporterData, ParamJsonExporterData } from '../export/Param';
import { ParamType } from '../../../poly/ParamType';
import { ParamInitValueSerialized } from '../../../params/types/ParamInitValueSerialized';
export declare class ParamJsonImporter<T extends BaseParamType> {
    protected _param: T;
    constructor(_param: T);
    process_data(data: ComplexParamJsonExporterData<ParamType>): void;
    add_main(data: ComplexParamJsonExporterData<ParamType>): void;
    static spare_params_data(params_data?: Dictionary<ParamJsonExporterData<ParamType>>): Dictionary<string | number | boolean | StringOrNumber3 | import("../../../params/ramp/RampValue").RampValueJson | StringOrNumber2 | StringOrNumber4 | ComplexParamJsonExporterData<ParamType> | null> | undefined;
    static non_spare_params_data_value(params_data?: Dictionary<ParamJsonExporterData<ParamType>>): Dictionary<ParamInitValueSerialized> | undefined;
    static params_data(spare: boolean, params_data?: Dictionary<ParamJsonExporterData<ParamType>>): Dictionary<ParamJsonExporterData<ParamType>> | undefined;
    static params_data_value(spare: boolean, params_data?: Dictionary<ParamJsonExporterData<ParamType>>): Dictionary<ParamInitValueSerialized> | undefined;
}
