import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SwitchAnimParamsConfig extends NodeParamsConfig {
    input: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SwitchAnimNode extends TypedAnimNode<SwitchAnimParamsConfig> {
    params_config: SwitchAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
