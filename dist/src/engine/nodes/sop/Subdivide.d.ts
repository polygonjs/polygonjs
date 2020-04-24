import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class SubdivideSopParamsConfig extends NodeParamsConfig {
    subdivisions: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class SubdivideSopNode extends TypedSopNode<SubdivideSopParamsConfig> {
    params_config: SubdivideSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};
