import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    change_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    new_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribNormalizeSopNode extends TypedSopNode<AttribNormalizeSopParamsConfig> {
    params_config: AttribNormalizeSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    _normalize_attribute(core_group: CoreGroup): void;
}
export {};
