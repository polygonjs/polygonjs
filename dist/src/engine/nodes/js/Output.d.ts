import { TypedJsNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { LinesController } from './code/utils/LinesController';
declare class OutputJsParamsConfig extends NodeParamsConfig {
}
export declare class OutputJsNode extends TypedJsNode<OutputJsParamsConfig> {
    params_config: OutputJsParamsConfig;
    static type(): string;
    initialize_node(): void;
    create_params(): void;
    set_lines(lines_controller: LinesController): void;
}
export {};
