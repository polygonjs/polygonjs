import { ParamJsonImporter } from '../Param';
import { ComplexParamJsonExporterData } from '../../export/Param';
import { RampParam } from '../../../../params/Ramp';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamRampJsonImporter extends ParamJsonImporter<RampParam> {
    add_main(data: ComplexParamJsonExporterData<ParamType.RAMP>): void;
}
