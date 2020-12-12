import { BaseParamType } from '../../../params/_Base';
import { ComplexParamJsonExporterData, ParamsJsonExporterData, ParamsInitData } from '../../../nodes/utils/io/IOController';
import { ParamType } from '../../../poly/ParamType';
export declare class ParamJsonImporter<T extends BaseParamType> {
    protected _param: T;
    constructor(_param: T);
    process_data(data: ComplexParamJsonExporterData<ParamType>): void;
    add_main(data: ComplexParamJsonExporterData<ParamType>): void;
    static spare_params_data(params_data?: ParamsJsonExporterData): ParamsJsonExporterData | undefined;
    static non_spare_params_data_value(params_data?: ParamsJsonExporterData): ParamsInitData | undefined;
    static params_data(spare: boolean, params_data?: ParamsJsonExporterData): ParamsJsonExporterData | undefined;
    private static params_data_value;
}
