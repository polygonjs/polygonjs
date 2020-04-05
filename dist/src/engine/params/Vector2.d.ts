import { TypedMultipleParam } from './_Multiple';
import { Vector2 } from 'three/src/math/Vector2';
import { ParamType } from '../poly/ParamType';
import { FloatParam } from './Float';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class Vector2Param extends TypedMultipleParam<ParamType.VECTOR2> {
    protected _value: Vector2;
    x: FloatParam;
    y: FloatParam;
    static type(): ParamType;
    static get component_names(): string[];
    get default_value_serialized(): StringOrNumber2;
    get value_serialized(): Number2;
    protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR2]): StringOrNumber2 | Vector2;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR2], raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR2]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR2], val2: ParamValuesTypeMap[ParamType.VECTOR2]): boolean;
    init_components(): void;
    set_value_from_components(): void;
}
