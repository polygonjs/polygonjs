import { Object3D } from 'three/src/core/Object3D';
import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { Group } from 'three/src/objects/Group';
import { ChildrenDisplayController } from './utils/ChildrenDisplayController';
import { TransformController } from './utils/TransformController';
import { HierarchyController } from './utils/HierarchyController';
export declare enum ObjNodeRenderOrder {
    MANAGER = 0,
    CAMERA = 2,
    LIGHT = 3
}
export declare class TypedObjNode<O extends Object3D, K extends NodeParamsConfig> extends TypedNode<NodeContext.OBJ, K> {
    static node_context(): NodeContext;
    static displayed_input_names(): string[];
    readonly render_order: number;
    readonly transform_controller: TransformController | undefined;
    readonly hierarchy_controller: HierarchyController | undefined;
    protected _children_group: Group;
    protected _object: O;
    private _create_children_group;
    protected _attachable_to_hierarchy: boolean;
    get attachable_to_hierarchy(): boolean;
    protected _used_in_scene: boolean;
    get used_in_scene(): boolean;
    add_object_to_parent(parent: Object3D): void;
    remove_object_from_parent(): void;
    readonly children_display_controller: ChildrenDisplayController | undefined;
    initialize_base_node(): void;
    get children_group(): Group;
    get object(): O;
    _create_object_with_attributes(): O;
    protected set_object_name(): void;
    create_object(): Object3D;
    is_display_node_cooking(): boolean;
    is_displayed(): boolean;
}
export declare type BaseObjNodeType = TypedObjNode<Object3D, any>;
export declare class BaseObjNodeClass extends TypedObjNode<Object3D, any> {
}
