import { ParamJsonExporter } from '../Param';
import { TypedNumericParam } from '../../../../params/_Numeric';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamNumericJsonExporter extends ParamJsonExporter<TypedNumericParam<ParamType>> {
    add_main(): string | number | boolean | StringOrNumber2 | StringOrNumber3 | StringOrNumber4 | import("../../../../params/ramp/RampValue").RampValueJson | null | undefined;
}
