import { Group } from 'three/src/objects/Group';
import { TypedBaseManagerNode } from './_Base';
import { BaseObjNodeType } from '../obj/_Base';
import { GeoObjNode } from '../obj/Geo';
import { NodeContext } from '../../poly/NodeContext';
import { ObjNodeChildrenMap } from '../../poly/registers/nodes/Obj';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
declare class ObjectsManagerParamsConfig extends NodeParamsConfig {
}
export declare class ObjectsManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
    params_config: ObjectsManagerParamsConfig;
    static type(): string;
    private _object;
    private _queued_nodes_by_id;
    private _queued_nodes_by_path;
    private _expected_geo_nodes;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    init_default_scene(): void;
    object(): Group;
    create_node<K extends keyof ObjNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): ObjNodeChildrenMap[K];
    children(): BaseObjNodeType[];
    nodes_by_type<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K][];
    multiple_display_flags_allowed(): boolean;
    add_to_queue(node: BaseObjNodeType): BaseObjNodeType | undefined;
    process_queue(): Promise<void>;
    update_object(node: BaseObjNodeType): void;
    get_parent_for_node(node: BaseObjNodeType): Group | null;
    add_to_scene(node: BaseObjNodeType): void;
    remove_from_scene(node: BaseObjNodeType): void;
    are_children_cooking(): boolean;
    expected_loading_geo_nodes_by_id(): Promise<Dictionary<GeoObjNode>>;
    add_to_parent_transform(node: BaseObjNodeType): void;
    remove_from_parent_transform(node: BaseObjNodeType): void;
    private _on_child_add;
    private _on_child_remove;
}
export {};
