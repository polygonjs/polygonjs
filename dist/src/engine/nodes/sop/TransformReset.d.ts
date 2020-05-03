import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TransformResetSopParamConfig extends NodeParamsConfig {
}
export declare class TransformResetSopNode extends TypedSopNode<TransformResetSopParamConfig> {
    params_config: TransformResetSopParamConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};
