import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class EasingAnimParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    in_out: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class EasingAnimNode extends TypedAnimNode<EasingAnimParamsConfig> {
    params_config: EasingAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    private easing_full_name;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
