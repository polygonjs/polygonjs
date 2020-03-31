import { GeoObjNode } from '../obj/Geo';
import { BaseSopNodeType } from '../sop/_Base';
import { Object3D } from 'three/src/core/Object3D';
import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
export declare class DisplayNodeController {
    protected node: GeoObjNode;
    _graph_node: CoreGraphNode;
    _display_node: BaseSopNodeType | undefined;
    _children_uuids_dict: Dictionary<boolean>;
    _children_length: number;
    private _request_display_node_container_bound;
    constructor(node: GeoObjNode);
    get display_node(): BaseSopNodeType | undefined;
    private _parent_object;
    set_parent_object(object: Object3D): void;
    get parent_object(): Object3D;
    initialize_node(): void;
    set_display_node(new_display_node: BaseSopNodeType): Promise<void>;
    remove_children(): void;
    get used_in_scene(): boolean;
    private request_display_node_container;
}
