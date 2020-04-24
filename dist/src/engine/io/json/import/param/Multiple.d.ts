import { ParamJsonImporter } from '../Param';
import { ComplexParamJsonExporterData } from '../../export/Param';
import { TypedMultipleParam } from '../../../../params/_Multiple';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamMultipleJsonImporter extends ParamJsonImporter<TypedMultipleParam<ParamType>> {
    add_main(data: ComplexParamJsonExporterData<ParamType>): void;
}
