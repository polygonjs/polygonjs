import { TypedMultipleParam } from './_Multiple';
import { FloatParam } from './Float';
import { Vector3 } from 'three/src/math/Vector3';
import { ParamType } from '../poly/ParamType';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class Vector3Param extends TypedMultipleParam<ParamType.VECTOR3> {
    protected _value: Vector3;
    x: FloatParam;
    y: FloatParam;
    z: FloatParam;
    static type(): ParamType;
    get component_names(): Readonly<string[]>;
    get default_value_serialized(): StringOrNumber3;
    get value_serialized(): Number3;
    protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR3]): Vector3 | StringOrNumber3;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR3], raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR3]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR3], val2: ParamValuesTypeMap[ParamType.VECTOR3]): boolean;
    init_components(): void;
    set_value_from_components(): void;
}
