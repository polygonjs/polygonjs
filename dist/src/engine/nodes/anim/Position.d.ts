import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PositionAnimParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    relative_to: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    offset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class PositionAnimNode extends TypedAnimNode<PositionAnimParamsConfig> {
    params_config: PositionAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _relative_label;
    private _absolute_label;
    cook(input_contents: TimelineBuilder[]): void;
}
export {};
