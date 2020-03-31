import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class DelaySopParamsConfig extends NodeParamsConfig {
    duration: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class DelaySopNode extends TypedSopNode<DelaySopParamsConfig> {
    params_config: DelaySopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(inputs_contents: CoreGroup[]): void;
}
export {};
