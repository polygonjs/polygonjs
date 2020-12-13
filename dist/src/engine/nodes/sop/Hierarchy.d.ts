import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HierarchySopParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    levels: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class HierarchySopNode extends TypedSopNode<HierarchySopParamsConfig> {
    params_config: HierarchySopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
}
export {};
