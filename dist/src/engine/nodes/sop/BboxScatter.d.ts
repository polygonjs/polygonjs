import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class BboxScatterSopParamsConfig extends NodeParamsConfig {
    step_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class BboxScatterSopNode extends TypedSopNode<BboxScatterSopParamsConfig> {
    params_config: BboxScatterSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};
