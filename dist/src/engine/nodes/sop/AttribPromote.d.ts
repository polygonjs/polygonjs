import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
export declare enum AttribPromoteMode {
    MIN = 0,
    MAX = 1,
    FIRST_FOUND = 2
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribPromoteSopParamsConfig extends NodeParamsConfig {
    class_from: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    class_to: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
    params_config: AttribPromoteSopParamsConfig;
    static type(): string;
    initialize_node(): void;
    create_params(): void;
    private _core_group;
    private _core_object;
    private _values_per_attrib_name;
    private _filtered_values_per_attrib_name;
    cook(input_contents: CoreGroup[]): void;
    private find_values;
    private find_values_from_points;
    private find_values_from_object;
    private filter_values;
    private set_values;
    private set_values_to_points;
    private set_values_to_object;
}
export {};
