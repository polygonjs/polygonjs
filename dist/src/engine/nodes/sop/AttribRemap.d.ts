import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribRemapSopParamsConfig extends NodeParamsConfig {
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    ramp: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.RAMP>;
    change_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    new_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribRemapSopNode extends TypedSopNode<AttribRemapSopParamsConfig> {
    params_config: AttribRemapSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    _remap_attribute(core_group: CoreGroup): void;
}
export {};
