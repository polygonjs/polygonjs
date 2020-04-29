import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
export declare enum HierarchyMode {
    ADD_PARENT = "add_parent",
    REMOVE_PARENT = "remove_parent"
}
export declare const HIERARCHY_MODES: Array<HierarchyMode>;
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HierarchySopParamsConfig extends NodeParamsConfig {
    mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    levels: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class HierarchySopNode extends TypedSopNode<HierarchySopParamsConfig> {
    params_config: HierarchySopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _add_parent_to_core_group;
    private _add_parent_to_object;
    private _add_new_parent;
    private _remove_parent_from_core_group;
    private _remove_parent_from_object;
    private _get_children_from_objects;
}
export {};
