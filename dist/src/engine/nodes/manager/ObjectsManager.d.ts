import { Group } from 'three/src/objects/Group';
import { TypedBaseManagerNode } from './_Base';
import { BaseObjNodeType } from '../obj/_Base';
import { NodeContext } from '../../poly/NodeContext';
import { ObjNodeChildrenMap } from '../../poly/registers/nodes/Obj';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { HierarchyObjNode } from '../obj/utils/HierarchyController';
import { ParamsInitData } from '../utils/io/IOController';
declare class ObjectsManagerParamsConfig extends NodeParamsConfig {
}
export declare class ObjectsManagerNode extends TypedBaseManagerNode<ObjectsManagerParamsConfig> {
    params_config: ObjectsManagerParamsConfig;
    static type(): string;
    private _object;
    private _queued_nodes_by_id;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    init_default_scene(): void;
    object(): Group;
    createNode<S extends keyof ObjNodeChildrenMap>(node_class: S, params_init_value_overrides?: ParamsInitData): ObjNodeChildrenMap[S];
    createNode<K extends valueof<ObjNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseObjNodeType[];
    nodes_by_type<K extends keyof ObjNodeChildrenMap>(type: K): ObjNodeChildrenMap[K][];
    multiple_display_flags_allowed(): boolean;
    private _add_to_queue;
    process_queue(): Promise<void>;
    private _update_object;
    get_parent_for_node(node: BaseObjNodeType): Group | null;
    private _add_to_scene;
    remove_from_scene(node: BaseObjNodeType): void;
    are_children_cooking(): boolean;
    add_to_parent_transform(node: HierarchyObjNode): void;
    remove_from_parent_transform(node: HierarchyObjNode): void;
    private _on_child_add;
    private _on_child_remove;
}
export {};
