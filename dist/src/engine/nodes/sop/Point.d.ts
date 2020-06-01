import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { CoreObject } from '../../../core/geometry/Object';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class PointSopParamsConfig extends NodeParamsConfig {
    update_x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    x: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    update_y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    y: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    update_z: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    z: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    update_normals: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class PointSopNode extends TypedSopNode<PointSopParamsConfig> {
    params_config: PointSopParamsConfig;
    static type(): string;
    private _x_arrays_by_geometry_uuid;
    private _y_arrays_by_geometry_uuid;
    private _z_arrays_by_geometry_uuid;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    _eval_expressions_for_core_group(core_group: CoreGroup): Promise<void>;
    _eval_expressions_for_core_object(core_object: CoreObject): Promise<void>;
    private _update_from_param;
    private _init_array_if_required;
    private _array_for_component;
    private _commit_tmp_values;
}
export {};
