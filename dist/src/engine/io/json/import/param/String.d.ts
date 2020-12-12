import { ParamJsonImporter } from '../Param';
import { ComplexParamJsonExporterData } from '../../../../nodes/utils/io/IOController';
import { StringParam } from '../../../../params/String';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamStringJsonImporter extends ParamJsonImporter<StringParam> {
    add_main(data: ComplexParamJsonExporterData<ParamType.STRING>): void;
}
