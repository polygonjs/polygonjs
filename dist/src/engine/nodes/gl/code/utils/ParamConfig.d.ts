import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { ParamValuesTypeMap } from '../../../../params/types/ParamValuesTypeMap';
import { BaseNodeType } from '../../../_Base';
import { BaseParamType } from '../../../../params/_Base';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { RampParam } from '../../../../params/Ramp';
import { OperatorPathParam } from '../../../../params/OperatorPath';
import { ParamConfig } from '../../../utils/code/configs/ParamConfig';
export declare class GlParamConfig<T extends ParamType> extends ParamConfig<T> {
    private _uniform_name;
    private _uniform;
    private _cached_param_value;
    constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], _uniform_name: string);
    get uniform_name(): string;
    get uniform(): IUniform;
    private _create_uniform;
    protected _callback(node: BaseNodeType, param: BaseParamType): void;
    static uniform_by_type(type: ParamType): IUniform;
    set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform): Promise<void>;
    set_uniform_value_from_ramp(param: RampParam, uniform: IUniform): void;
    has_value_changed(new_value: ParamValuesTypeMap[T]): boolean;
    is_video_texture(): boolean;
}
