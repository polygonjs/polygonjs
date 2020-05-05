import { BaseParamType } from '../../../params/_Base';
export declare class ParamCodeExporter<T extends BaseParamType> {
    protected _param: T;
    _lines: string[];
    constructor(_param: T);
    process(): string[];
    default_value(): string | number | boolean | import("three").Vector2 | import("three").Color | import("three").Vector3 | StringOrNumber3 | import("../../../params/ramp/RampValue").RampValue | import("three").Vector4 | import("../../../params/ramp/RampValue").RampValueJson | StringOrNumber2 | StringOrNumber4 | null;
    node_var_name(): string;
    prefix(): string;
    protected add_main(): void;
    add_options(): void;
}
