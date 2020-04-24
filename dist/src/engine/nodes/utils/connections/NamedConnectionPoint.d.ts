import { ConnectionPointType, ConnectionPointInitValueMapGeneric, IConnectionPointTypeToParamTypeMap } from './ConnectionPointType';
export interface TypedNamedConnectionPointData<T extends ConnectionPointType> {
    name: string;
    type: T;
}
export declare class TypedNamedConnectionPoint<T extends ConnectionPointType> {
    protected _name: string;
    protected _type: T;
    protected _init_value?: ConnectionPointInitValueMapGeneric[T] | undefined;
    private _json;
    constructor(_name: string, _type: T, _init_value?: ConnectionPointInitValueMapGeneric[T] | undefined);
    get name(): string;
    get type(): T;
    get param_type(): IConnectionPointTypeToParamTypeMap[T];
    get init_value(): ConnectionPointInitValueMapGeneric[T] | undefined;
    to_json(): TypedNamedConnectionPointData<T>;
    private _create_json;
}
export declare type BaseNamedConnectionPointType = TypedNamedConnectionPoint<ConnectionPointType>;
