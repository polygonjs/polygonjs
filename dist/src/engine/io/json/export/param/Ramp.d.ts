import { ParamJsonExporter } from '../Param';
import { RampParam } from '../../../../params/Ramp';
export declare class ParamRampJsonExporter extends ParamJsonExporter<RampParam> {
    add_main(): import("../../../../params/ramp/RampValue").RampValueJson | undefined;
}
