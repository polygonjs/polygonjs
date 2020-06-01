import { TypedSopNode } from './_Base';
import { CopyStamp } from './utils/CopyStamp';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CopySopParamsConfig extends NodeParamsConfig {
    count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    transform_only: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    copy_attributes: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    attributes_to_copy: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    use_copy_expr: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class CopySopNode extends TypedSopNode<CopySopParamsConfig> {
    params_config: CopySopParamsConfig;
    static type(): string;
    private _attribute_names_to_copy;
    private _objects;
    private _stamp_node;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(): Promise<void>;
    private cook_with_template;
    private _copy_moved_objects_on_template_points;
    private _copy_moved_object_on_template_point;
    private _get_moved_objects_for_template_point;
    private _stamp_instance_group_if_required;
    private _copy_moved_objects_for_each_instance;
    private _copy_moved_objects_for_instance;
    private cook_without_template;
    private _copy_attributes_from_template;
    stamp_value(attrib_name?: string): string | number | boolean | Number3 | Number2 | Number4 | Vector2Like | ColorLike;
    get stamp_node(): CopyStamp;
    private create_stamp_node;
}
export {};
