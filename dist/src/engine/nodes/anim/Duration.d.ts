import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class DurationAnimParamsConfig extends NodeParamsConfig {
    duration: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class DurationAnimNode extends TypedAnimNode<DurationAnimParamsConfig> {
    params_config: DurationAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
