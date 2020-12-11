import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
import { BaseNodeType } from '../../../_Base';
import { BaseParamType } from '../../../../params/_Base';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { RampParam } from '../../../../params/Ramp';
import { OperatorPathParam } from '../../../../params/OperatorPath';
import { ParamConfig } from '../../../utils/code/configs/ParamConfig';
export declare class GlParamConfig<T extends ParamType> extends ParamConfig<T> {
    private _uniform_name;
    private _uniform;
    constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], _uniform_name: string);
    get uniform_name(): string;
    get uniform(): IUniform;
    private _create_uniform;
    execute_callback(node: BaseNodeType, param: BaseParamType): void;
    protected _callback(node: BaseNodeType, param: BaseParamType): void;
    static callback(param: BaseParamType, uniform: IUniform): void;
    static uniform_by_type(type: ParamType): IUniform;
    static set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform): void;
    set_uniform_value_from_ramp(param: RampParam, uniform: IUniform): void;
}
