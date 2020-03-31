import { ParamConfig } from '../configs/ParamConfig';
import { ParamType } from '../../../../poly/ParamType';
import { ParamInitValuesTypeMap } from '../../../../params/types/ParamInitValuesTypeMap';
export declare class ParamConfigsController {
    private _param_configs;
    reset(): void;
    push(param_config: ParamConfig<ParamType>): void;
    create_and_push<T extends ParamType>(type: T, name: string, default_value: ParamInitValuesTypeMap[T], uniform_name: string): void;
    get list(): Readonly<ParamConfig<ParamType>[]>;
}
