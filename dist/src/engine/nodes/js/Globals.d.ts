import { TypedJsNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { LinesController } from './code/utils/LinesController';
declare class GlobalsJsParamsConfig extends NodeParamsConfig {
}
export declare class GlobalsJsNode extends TypedJsNode<GlobalsJsParamsConfig> {
    params_config: GlobalsJsParamsConfig;
    static type(): string;
    create_params(): void;
    set_lines(lines_controller: LinesController): void;
}
export {};
