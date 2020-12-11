import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { TypedParam, BaseParamType } from '../../../../params/_Base';
import { BaseNodeType } from '../../../_Base';
import { ParamOptions } from '../../../../params/utils/OptionsController';
export declare class ParamConfig<T extends ParamType> {
    protected _type: T;
    protected _name: string;
    protected _default_value: ParamInitValuesTypeMap[T];
    constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T]);
    static from_param<K extends ParamType>(param: TypedParam<K>): ParamConfig<K>;
    get type(): T;
    get name(): string;
    get default_value(): ParamInitValuesTypeMap[T];
    get param_options(): ParamOptions;
    protected _callback(node: BaseNodeType, param: BaseParamType): void;
}
