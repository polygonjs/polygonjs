import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TargetAnimParamsConfig extends NodeParamsConfig {
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    node_path: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    object_mask: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    update_matrix: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class TargetAnimNode extends TypedAnimNode<TargetAnimParamsConfig> {
    params_config: TargetAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): void;
    private _create_target;
    private _set_update_callback;
}
export {};
