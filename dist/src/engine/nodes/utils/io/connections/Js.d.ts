import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { ParamType } from '../../../../poly/ParamType';
export declare enum JsConnectionPointType {
    BOOL = "bool",
    INT = "int",
    FLOAT = "float",
    VEC2 = "vec2",
    VEC3 = "vec3",
    VEC4 = "vec4"
}
export declare const JS_CONNECTION_POINT_TYPES: Array<JsConnectionPointType>;
declare type ConnectionPointTypeToParamTypeMapGeneric = {
    [key in JsConnectionPointType]: ParamType | undefined;
};
export interface IConnectionPointTypeToParamTypeMap extends ConnectionPointTypeToParamTypeMapGeneric {
    [JsConnectionPointType.BOOL]: ParamType.BOOLEAN;
    [JsConnectionPointType.INT]: ParamType.INTEGER;
    [JsConnectionPointType.FLOAT]: ParamType.FLOAT;
    [JsConnectionPointType.VEC2]: ParamType.VECTOR2;
    [JsConnectionPointType.VEC3]: ParamType.VECTOR3;
    [JsConnectionPointType.VEC4]: ParamType.VECTOR4;
}
export declare const JsConnectionPointTypeToParamTypeMap: IConnectionPointTypeToParamTypeMap;
declare type ParamTypeToConnectionPointTypeMapGeneric = {
    [key in ParamType]: JsConnectionPointType | undefined;
};
export interface IParamTypeToConnectionPointTypeMap extends ParamTypeToConnectionPointTypeMapGeneric {
    [ParamType.BOOLEAN]: JsConnectionPointType.BOOL;
    [ParamType.COLOR]: JsConnectionPointType.VEC3;
    [ParamType.INTEGER]: JsConnectionPointType.INT;
    [ParamType.FLOAT]: JsConnectionPointType.FLOAT;
    [ParamType.FOLDER]: undefined;
    [ParamType.VECTOR2]: JsConnectionPointType.VEC2;
    [ParamType.VECTOR3]: JsConnectionPointType.VEC3;
    [ParamType.VECTOR4]: JsConnectionPointType.VEC4;
    [ParamType.BUTTON]: undefined;
    [ParamType.OPERATOR_PATH]: undefined;
    [ParamType.RAMP]: undefined;
    [ParamType.SEPARATOR]: undefined;
    [ParamType.STRING]: undefined;
}
export declare const ParamTypeToConnectionPointTypeMap: IParamTypeToConnectionPointTypeMap;
export declare type ConnectionPointInitValueMapGeneric = {
    [key in JsConnectionPointType]: ParamInitValuesTypeMap[IConnectionPointTypeToParamTypeMap[key]];
};
export declare const JsConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric;
export declare type ConnectionPointComponentsCountMapGeneric = {
    [key in JsConnectionPointType]: number;
};
export declare const GlConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric;
export interface JsConnectionPointData<T extends JsConnectionPointType> {
    name: string;
    type: T;
}
import { BaseConnectionPoint } from './_Base';
export declare class JsConnectionPoint<T extends JsConnectionPointType> extends BaseConnectionPoint {
    protected _name: string;
    protected _type: T;
    protected _json: JsConnectionPointData<T> | undefined;
    protected _init_value: any;
    constructor(_name: string, _type: T);
    get type(): T;
    are_types_matched(src_type: string, dest_type: string): boolean;
    get param_type(): IConnectionPointTypeToParamTypeMap[T];
    get init_value(): any;
    to_json(): JsConnectionPointData<T>;
    protected _create_json(): JsConnectionPointData<T>;
}
export declare type BaseJsConnectionPoint = JsConnectionPoint<JsConnectionPointType>;
export {};
