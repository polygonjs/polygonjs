import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class RepeatAnimParamsConfig extends NodeParamsConfig {
    unlimited: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    delay: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    yoyo: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class RepeatAnimNode extends TypedAnimNode<RepeatAnimParamsConfig> {
    params_config: RepeatAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _repeat_params;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
