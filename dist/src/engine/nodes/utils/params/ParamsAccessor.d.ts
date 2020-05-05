import { NodeParamsConfig } from './ParamsConfig';
export declare type ParamsAccessorType<T extends NodeParamsConfig> = {
    readonly [P in keyof T]: T[P]['param_class'];
};
export declare class ParamsAccessor<T extends NodeParamsConfig> {
    constructor();
}
