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
    private _remap_attribute;
    private _get_remaped_values;
    private _get_normalized_float;
    private _get_normalized_vector2;
    private _get_normalized_vector3;
    private _get_normalized_vector4;
}
export {};
