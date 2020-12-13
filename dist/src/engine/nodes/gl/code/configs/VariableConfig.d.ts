interface VariableConfigOptions {
    default_from_attribute?: boolean;
    default?: string;
    if?: string;
    prefix?: string;
    suffix?: string;
}
export declare class VariableConfig {
    private _name;
    private _options;
    constructor(_name: string, _options?: VariableConfigOptions);
    name(): string;
    default_from_attribute(): boolean;
    default(): string | undefined;
    if_condition(): string | undefined;
    prefix(): string;
    suffix(): string;
}
export {};
