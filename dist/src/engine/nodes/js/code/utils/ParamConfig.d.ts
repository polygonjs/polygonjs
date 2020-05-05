import { Vector4 } from 'three/src/math/Vector4';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { ParamConfig } from '../../../utils/code/configs/ParamConfig';
import { Color } from 'three/src/math/Color';
export declare class JsParamConfig<T extends ParamType> extends ParamConfig<T> {
    private _uniform_name;
    constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], _uniform_name: string);
    get uniform_name(): string;
    static uniform_by_type(type: ParamType): {
        value: number;
    } | {
        value: Color;
    } | {
        value: null;
    } | {
        value: Vector2;
    } | {
        value: Vector3;
    } | {
        value: Vector4;
    };
}
