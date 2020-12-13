import { TypedSopNode } from './_Base';
import { AttribType } from '../../../core/geometry/Constant';
import { CoreObject } from '../../../core/geometry/Object';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribCreateSopParamsConfig extends NodeParamsConfig {
    group: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    class: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    value1: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    value2: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR2>;
    value3: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    value4: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
    string: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class AttribCreateSopNode extends TypedSopNode<AttribCreateSopParamsConfig> {
    params_config: AttribCreateSopParamsConfig;
    static type(): string;
    private _x_arrays_by_geometry_uuid;
    private _y_arrays_by_geometry_uuid;
    private _z_arrays_by_geometry_uuid;
    private _w_arrays_by_geometry_uuid;
    initialize_node(): void;
    private _operation;
    cook(input_contents: CoreGroup[]): void;
    private _add_attribute;
    add_point_attribute(attrib_type: AttribType, core_group: CoreGroup): Promise<void>;
    add_object_attribute(attrib_type: AttribType, core_group: CoreGroup): Promise<void>;
    add_numeric_attribute_to_points(core_object: CoreObject): Promise<void>;
    add_numeric_attribute_to_object(core_objects: CoreObject[]): Promise<void>;
    add_string_attribute_to_points(core_object: CoreObject): Promise<void>;
    add_string_attribute_to_object(core_objects: CoreObject[]): Promise<void>;
    private _init_array_if_required;
    private _is_using_expression;
}
export {};
