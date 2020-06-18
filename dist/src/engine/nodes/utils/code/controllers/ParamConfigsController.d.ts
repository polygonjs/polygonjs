import { ParamConfig } from '../../params/ParamsConfig';
export declare class ParamConfigsController<PC extends ParamConfig> {
    private _param_configs;
    reset(): void;
    push(param_config: PC): void;
    get list(): Readonly<PC[]>;
}
