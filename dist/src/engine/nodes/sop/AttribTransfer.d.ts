import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { CoreOctree } from '../../../core/math/octree/Octree';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AttribTransferSopParamsConfig extends NodeParamsConfig {
    src_group: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    dest_group: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    name: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    max_samples_count: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    distance_threshold: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    blend_width: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AttribTransferSopNode extends TypedSopNode<AttribTransferSopParamsConfig> {
    params_config: AttribTransferSopParamsConfig;
    static type(): string;
    _core_group_dest: CoreGroup;
    _core_group_src: CoreGroup;
    _attrib_names: string[];
    _octree_timestamp: number | undefined;
    _prev_param_src_group: string | undefined;
    _octree: CoreOctree | undefined;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    _error_if_attribute_not_found_on_second_input(): void;
    private _build_octree_if_required;
    private _add_attribute_if_required;
    private _transfer_attributes;
    private _transfer_attributes_for_point;
    private _interpolate_points;
}
export {};
