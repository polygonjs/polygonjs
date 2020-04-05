import { ParamJsonExporter } from '../Param';
import { TypedNumericParam } from '../../../../params/_Numeric';
import { ParamType } from '../../../../poly/ParamType';
export declare class ParamNumericJsonExporter extends ParamJsonExporter<TypedNumericParam<ParamType>> {
    add_main(): string | number | boolean | StringOrNumber3 | import("../../../../params/ramp/RampValue").RampValueJson | StringOrNumber2 | StringOrNumber4 | null | undefined;
}
