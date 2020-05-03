import { TypedSopNode } from './_Base';
import { CoreObject } from '../../../core/geometry/Object';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class ColorSopParamsConfig extends NodeParamsConfig {
    from_attribute: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    attrib_name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    as_hsv: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class ColorSopNode extends TypedSopNode<ColorSopParamsConfig> {
    params_config: ColorSopParamsConfig;
    static type(): string;
    private _r_arrays_by_geometry_uuid;
    private _g_arrays_by_geometry_uuid;
    private _b_arrays_by_geometry_uuid;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    _set_from_attribute(core_object: CoreObject): void;
    private _create_init_color;
    _eval_simple_values(core_object: CoreObject): void;
    _eval_expressions(core_object: CoreObject): Promise<void>;
    private _update_from_param;
    private _init_array_if_required;
    private _commit_tmp_values;
}
export {};
