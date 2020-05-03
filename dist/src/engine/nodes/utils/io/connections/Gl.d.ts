import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { ParamType } from '../../../../poly/ParamType';
export declare enum GlConnectionPointType {
    BOOL = "bool",
    INT = "int",
    FLOAT = "float",
    VEC2 = "vec2",
    VEC3 = "vec3",
    VEC4 = "vec4",
    SAMPLER_2D = "sampler2D"
}
export declare const GL_CONNECTION_POINT_TYPES: Array<GlConnectionPointType>;
declare type ConnectionPointTypeToParamTypeMapGeneric = {
    [key in GlConnectionPointType]: ParamType;
};
export interface IConnectionPointTypeToParamTypeMap extends ConnectionPointTypeToParamTypeMapGeneric {
    [GlConnectionPointType.BOOL]: ParamType.BOOLEAN;
    [GlConnectionPointType.INT]: ParamType.INTEGER;
    [GlConnectionPointType.FLOAT]: ParamType.FLOAT;
    [GlConnectionPointType.VEC2]: ParamType.VECTOR2;
    [GlConnectionPointType.VEC3]: ParamType.VECTOR3;
    [GlConnectionPointType.VEC4]: ParamType.VECTOR4;
}
export declare const GlConnectionPointTypeToParamTypeMap: IConnectionPointTypeToParamTypeMap;
declare type ParamTypeToConnectionPointTypeMapGeneric = {
    [key in ParamType]: GlConnectionPointType | undefined;
};
export interface IParamTypeToConnectionPointTypeMap extends ParamTypeToConnectionPointTypeMapGeneric {
    [ParamType.BOOLEAN]: GlConnectionPointType.BOOL;
    [ParamType.COLOR]: GlConnectionPointType.VEC3;
    [ParamType.INTEGER]: GlConnectionPointType.INT;
    [ParamType.FLOAT]: GlConnectionPointType.FLOAT;
    [ParamType.FOLDER]: undefined;
    [ParamType.VECTOR2]: GlConnectionPointType.VEC2;
    [ParamType.VECTOR3]: GlConnectionPointType.VEC3;
    [ParamType.VECTOR4]: GlConnectionPointType.VEC4;
    [ParamType.BUTTON]: undefined;
    [ParamType.OPERATOR_PATH]: undefined;
    [ParamType.RAMP]: undefined;
    [ParamType.SEPARATOR]: undefined;
    [ParamType.STRING]: undefined;
}
export declare const ParamTypeToConnectionPointTypeMap: IParamTypeToConnectionPointTypeMap;
export declare type ConnectionPointInitValueMapGeneric = {
    [key in GlConnectionPointType]: ParamInitValuesTypeMap[IConnectionPointTypeToParamTypeMap[key]];
};
export declare const GlConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric;
export declare type ConnectionPointComponentsCountMapGeneric = {
    [key in GlConnectionPointType]: number;
};
export declare const GlConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric;
export interface GlConnectionPointData<T extends GlConnectionPointType> {
    name: string;
    type: T;
}
import { BaseConnectionPoint } from './_Base';
export declare class GlConnectionPoint<T extends GlConnectionPointType> extends BaseConnectionPoint {
    protected _name: string;
    protected _type: T;
    protected _json: GlConnectionPointData<T> | undefined;
    protected _init_value: any;
    constructor(_name: string, _type: T);
    get type(): T;
    are_types_matched(src_type: string, dest_type: string): boolean;
    get param_type(): IConnectionPointTypeToParamTypeMap[T];
    get init_value(): any;
    to_json(): GlConnectionPointData<T>;
    protected _create_json(): GlConnectionPointData<T>;
}
export declare type BaseGlConnectionPoint = GlConnectionPoint<GlConnectionPointType>;
export {};
