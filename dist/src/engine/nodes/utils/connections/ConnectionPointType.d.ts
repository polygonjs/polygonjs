import { ParamInitValuesTypeMap } from '../../../params/types/ParamInitValuesTypeMap';
import { ParamType } from '../../../poly/ParamType';
export declare enum ConnectionPointType {
    BOOL = "bool",
    INT = "int",
    FLOAT = "float",
    VEC2 = "vec2",
    VEC3 = "vec3",
    VEC4 = "vec4",
    SAMPLER_2D = "sampler2D"
}
export declare const ConnectionPointTypes: Array<ConnectionPointType>;
declare type ConnectionPointTypeToParamTypeMapGeneric = {
    [key in ConnectionPointType]: ParamType;
};
export interface IConnectionPointTypeToParamTypeMap extends ConnectionPointTypeToParamTypeMapGeneric {
    [ConnectionPointType.BOOL]: ParamType.BOOLEAN;
    [ConnectionPointType.INT]: ParamType.INTEGER;
    [ConnectionPointType.FLOAT]: ParamType.FLOAT;
    [ConnectionPointType.VEC2]: ParamType.VECTOR2;
    [ConnectionPointType.VEC3]: ParamType.VECTOR3;
    [ConnectionPointType.VEC4]: ParamType.VECTOR4;
}
export declare const ConnectionPointTypeToParamTypeMap: IConnectionPointTypeToParamTypeMap;
declare type ParamTypeToConnectionPointTypeMapGeneric = {
    [key in ParamType]: ConnectionPointType | undefined;
};
export interface IParamTypeToConnectionPointTypeMap extends ParamTypeToConnectionPointTypeMapGeneric {
    [ParamType.BOOLEAN]: ConnectionPointType.BOOL;
    [ParamType.COLOR]: ConnectionPointType.VEC3;
    [ParamType.INTEGER]: ConnectionPointType.INT;
    [ParamType.FLOAT]: ConnectionPointType.FLOAT;
    [ParamType.FOLDER]: undefined;
    [ParamType.VECTOR2]: ConnectionPointType.VEC2;
    [ParamType.VECTOR3]: ConnectionPointType.VEC3;
    [ParamType.VECTOR4]: ConnectionPointType.VEC4;
    [ParamType.BUTTON]: undefined;
    [ParamType.OPERATOR_PATH]: undefined;
    [ParamType.RAMP]: undefined;
    [ParamType.SEPARATOR]: undefined;
    [ParamType.STRING]: undefined;
}
export declare const ParamTypeToConnectionPointTypeMap: IParamTypeToConnectionPointTypeMap;
export declare type ConnectionPointInitValueMapGeneric = {
    [key in ConnectionPointType]: ParamInitValuesTypeMap[IConnectionPointTypeToParamTypeMap[key]];
};
export declare const ConnectionPointInitValueMap: ConnectionPointInitValueMapGeneric;
export declare type ConnectionPointComponentsCountMapGeneric = {
    [key in ConnectionPointType]: number;
};
export declare const ConnectionPointComponentsCountMap: ConnectionPointComponentsCountMapGeneric;
export {};
