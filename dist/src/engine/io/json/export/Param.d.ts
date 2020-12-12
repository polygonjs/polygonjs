import { BaseParamType } from '../../../params/_Base';
import { ParamType } from '../../../poly/ParamType';
import { ComplexParamJsonExporterData } from '../../../nodes/utils/io/IOController';
export declare class ParamJsonExporter<T extends BaseParamType> {
    protected _param: T;
    protected _complex_data: ComplexParamJsonExporterData<ParamType>;
    constructor(_param: T);
    get required(): boolean;
    data(): any;
    private _data_simple;
    private _data_complex;
    protected _require_data_complex(): boolean;
    protected add_main(): void;
}
