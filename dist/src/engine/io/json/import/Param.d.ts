import { BaseParamType } from '../../../params/_Base';
import { ComplexParamJsonExporterData } from '../export/Param';
import { ParamType } from '../../../poly/ParamType';
export declare class ParamJsonImporter<T extends BaseParamType> {
    protected _param: T;
    constructor(_param: T);
    process_data(data: ComplexParamJsonExporterData<ParamType>): void;
    add_main(data: ComplexParamJsonExporterData<ParamType>): void;
}
