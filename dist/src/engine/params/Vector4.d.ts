import { TypedMultipleParam } from './_Multiple';
import { Vector4 } from 'three/src/math/Vector4';
import { ParamType } from '../poly/ParamType';
import { FloatParam } from './Float';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class Vector4Param extends TypedMultipleParam<ParamType.VECTOR4> {
    protected _value: Vector4;
    x: FloatParam;
    y: FloatParam;
    z: FloatParam;
    w: FloatParam;
    static type(): ParamType;
    static get component_names(): string[];
    get default_value_serialized(): StringOrNumber4;
    get value_serialized(): Number4;
    protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR4]): Vector4 | StringOrNumber4;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR4], raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR4]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR4], val2: ParamValuesTypeMap[ParamType.VECTOR4]): boolean;
    init_components(): void;
    set_value_from_components(): void;
}
