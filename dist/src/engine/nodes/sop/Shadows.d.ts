import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ShadowsSopParamsConfig extends NodeParamsConfig {
    cast_shadow: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    receive_shadow: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    apply_to_children: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class ShadowsSopNode extends TypedSopNode<ShadowsSopParamsConfig> {
    params_config: ShadowsSopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
}
export {};
