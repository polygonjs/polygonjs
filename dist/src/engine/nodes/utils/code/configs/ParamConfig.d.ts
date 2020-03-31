import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { ParamValuesTypeMap } from '../../../../params/types/ParamValuesTypeMap';
import { BaseNodeType } from '../../../_Base';
import { TypedParam, BaseParamType } from '../../../../params/_Base';
import { NodeContext } from '../../../../poly/NodeContext';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { RampParam } from '../../../../params/Ramp';
import { OperatorPathParam } from '../../../../params/OperatorPath';
export declare class ParamConfig<T extends ParamType> {
    private _type;
    private _name;
    private _default_value;
    private _uniform_name;
    private _uniform;
    private _cached_param_value;
    constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], _uniform_name: string);
    static from_param<K extends ParamType>(param: TypedParam<K>, uniform_name: string): ParamConfig<K>;
    get type(): T;
    get name(): string;
    get default_value(): ParamInitValuesTypeMap[T];
    get uniform_name(): string;
    get uniform(): IUniform;
    private _create_uniform;
    get param_options(): {
        callback: (node: BaseNodeType, param: BaseParamType) => void;
        node_selection: {
            context: NodeContext;
        };
    } | {
        callback: (node: BaseNodeType, param: BaseParamType) => void;
        node_selection?: undefined;
    };
    private _callback;
    static uniform_by_type(type: ParamType): IUniform;
    set_uniform_value(node: BaseNodeType): Promise<void>;
    set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform): Promise<void>;
    set_uniform_value_from_ramp(param: RampParam, uniform: IUniform): void;
    has_value_changed(new_value: ParamValuesTypeMap[T]): boolean;
    is_video_texture(): boolean;
}
