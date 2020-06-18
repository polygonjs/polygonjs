import { TypedMultipleParam } from './_Multiple';
import { Color } from 'three/src/math/Color';
import { ParamType } from '../poly/ParamType';
import { FloatParam } from './Float';
import { ParamValuesTypeMap } from './types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from './types/ParamInitValuesTypeMap';
export declare class ColorParam extends TypedMultipleParam<ParamType.COLOR> {
    protected _value: Color;
    r: FloatParam;
    g: FloatParam;
    b: FloatParam;
    static type(): ParamType;
    get component_names(): Readonly<string[]>;
    get default_value_serialized(): StringOrNumber3;
    get value_serialized(): Number3;
    protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.COLOR]): Color | StringOrNumber3;
    static are_raw_input_equal(raw_input1: ParamInitValuesTypeMap[ParamType.COLOR], raw_input2: ParamInitValuesTypeMap[ParamType.COLOR]): boolean;
    static are_values_equal(val1: ParamValuesTypeMap[ParamType.COLOR], val2: ParamValuesTypeMap[ParamType.COLOR]): boolean;
    init_components(): void;
    set_value_from_components(): void;
}
