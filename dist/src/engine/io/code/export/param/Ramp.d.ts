import { ParamCodeExporter } from '../Param';
import { RampParam } from '../../../../params/Ramp';
export declare class ParamRampCodeExporter extends ParamCodeExporter<RampParam> {
    default_value(): string;
    add_main(): void;
}
