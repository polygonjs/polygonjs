import { NodeParamsConfig } from './ParamsConfig';
export declare type ParamsValueAccessorType<T extends NodeParamsConfig> = {
    readonly [P in keyof T]: T[P]['value_type'];
};
export declare class ParamsValueAccessor<T extends NodeParamsConfig> {
    constructor();
}
