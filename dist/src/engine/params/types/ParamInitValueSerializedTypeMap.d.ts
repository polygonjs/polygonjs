import { RampValueJson } from '../ramp/RampValue';
import { ParamType } from '../../poly/ParamType';
import { ParamInitValuesTypeMap } from './ParamInitValuesTypeMap';
declare type ParamInitValueSerializedTypeMapGeneric = {
    [key in ParamType]: any;
};
export interface ParamInitValueSerializedTypeMap extends ParamInitValueSerializedTypeMapGeneric {
    [ParamType.BOOLEAN]: ParamInitValuesTypeMap[ParamType.BOOLEAN];
    [ParamType.BUTTON]: ParamInitValuesTypeMap[ParamType.BUTTON];
    [ParamType.COLOR]: StringOrNumber3;
    [ParamType.FLOAT]: ParamInitValuesTypeMap[ParamType.FLOAT];
    [ParamType.FOLDER]: ParamInitValuesTypeMap[ParamType.FOLDER];
    [ParamType.INTEGER]: ParamInitValuesTypeMap[ParamType.INTEGER];
    [ParamType.OPERATOR_PATH]: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH];
    [ParamType.RAMP]: RampValueJson;
    [ParamType.SEPARATOR]: ParamInitValuesTypeMap[ParamType.SEPARATOR];
    [ParamType.STRING]: ParamInitValuesTypeMap[ParamType.STRING];
    [ParamType.VECTOR2]: StringOrNumber2;
    [ParamType.VECTOR3]: StringOrNumber3;
    [ParamType.VECTOR4]: StringOrNumber4;
}
export {};
