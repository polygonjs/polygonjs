import { ParamType } from '../../../poly/ParamType';
import { ParamOptions } from '../../../params/utils/OptionsController';
import { ParamValuesTypeMap } from '../../../params/types/ParamValuesTypeMap';
import { ParamInitValuesTypeMap } from '../../../params/types/ParamInitValuesTypeMap';
import { ParamConstructorMap } from '../../../params/types/ParamConstructorMap';
import { ParamOptionsByTypeMap } from '../../../params/types/ParamOptionsByTypeMap';
export declare class ParamTemplate<T extends ParamType> {
    type: T;
    init_value: ParamInitValuesTypeMap[T];
    options?: ParamOptions | undefined;
    readonly value_type: ParamValuesTypeMap[T];
    readonly param_class: ParamConstructorMap[T];
    constructor(type: T, init_value: ParamInitValuesTypeMap[T], options?: ParamOptions | undefined);
}
export declare class ParamConfig {
    static BUTTON(init_value: ParamInitValuesTypeMap[ParamType.BUTTON], options?: ParamOptionsByTypeMap[ParamType.BUTTON]): ParamTemplate<ParamType.BUTTON>;
    static BOOLEAN(init_value: ParamInitValuesTypeMap[ParamType.BOOLEAN], options?: ParamOptionsByTypeMap[ParamType.BOOLEAN]): ParamTemplate<ParamType.BOOLEAN>;
    static COLOR(init_value: ParamInitValuesTypeMap[ParamType.COLOR], options?: ParamOptionsByTypeMap[ParamType.COLOR]): ParamTemplate<ParamType.COLOR>;
    static FLOAT(init_value: ParamInitValuesTypeMap[ParamType.FLOAT], options?: ParamOptionsByTypeMap[ParamType.FLOAT]): ParamTemplate<ParamType.FLOAT>;
    static FOLDER(init_value?: ParamInitValuesTypeMap[ParamType.FOLDER], options?: ParamOptionsByTypeMap[ParamType.FOLDER]): ParamTemplate<ParamType.FOLDER>;
    static INTEGER(init_value: ParamInitValuesTypeMap[ParamType.INTEGER], options?: ParamOptionsByTypeMap[ParamType.INTEGER]): ParamTemplate<ParamType.INTEGER>;
    static RAMP(init_value?: ParamInitValuesTypeMap[ParamType.RAMP], options?: ParamOptionsByTypeMap[ParamType.RAMP]): ParamTemplate<ParamType.RAMP>;
    static SEPARATOR(init_value?: ParamInitValuesTypeMap[ParamType.SEPARATOR], options?: ParamOptionsByTypeMap[ParamType.SEPARATOR]): ParamTemplate<ParamType.SEPARATOR>;
    static STRING(init_value?: ParamInitValuesTypeMap[ParamType.STRING], options?: ParamOptionsByTypeMap[ParamType.STRING]): ParamTemplate<ParamType.STRING>;
    static VECTOR2(init_value: ParamInitValuesTypeMap[ParamType.VECTOR2], options?: ParamOptionsByTypeMap[ParamType.VECTOR2]): ParamTemplate<ParamType.VECTOR2>;
    static VECTOR3(init_value: ParamInitValuesTypeMap[ParamType.VECTOR3], options?: ParamOptionsByTypeMap[ParamType.VECTOR3]): ParamTemplate<ParamType.VECTOR3>;
    static VECTOR4(init_value: ParamInitValuesTypeMap[ParamType.VECTOR4], options?: ParamOptionsByTypeMap[ParamType.VECTOR4]): ParamTemplate<ParamType.VECTOR4>;
    static OPERATOR_PATH(init_value: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH], options?: ParamOptionsByTypeMap[ParamType.OPERATOR_PATH]): ParamTemplate<ParamType.OPERATOR_PATH>;
    static NODE_PATH(init_value: ParamInitValuesTypeMap[ParamType.NODE_PATH], options?: ParamOptionsByTypeMap[ParamType.NODE_PATH]): ParamTemplate<ParamType.NODE_PATH>;
}
export declare class NodeParamsConfig implements Dictionary<ParamTemplate<ParamType>> {
    [name: string]: ParamTemplate<ParamType>;
}
