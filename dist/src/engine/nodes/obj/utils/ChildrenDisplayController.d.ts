import { BaseObjNodeClass } from '../_Base';
import { DisplayNodeController, DisplayNodeControllerCallbacks } from '../../utils/DisplayNodeController';
import { Group } from 'three/src/objects/Group';
interface BaseObjNodeClassWithDisplayNode extends BaseObjNodeClass {
    display_node_controller: DisplayNodeController;
}
export declare class ChildrenDisplayController {
    private node;
    _children_uuids_dict: Dictionary<boolean>;
    _children_length: number;
    private _sop_group;
    constructor(node: BaseObjNodeClassWithDisplayNode);
    private _create_sop_group;
    get sop_group(): Group;
    set_sop_group_name(): void;
    display_node_controller_callbacks(): DisplayNodeControllerCallbacks;
    initialize_node(): void;
    get used_in_scene(): boolean;
    request_display_node_container(): Promise<void>;
    remove_children(): void;
    _set_content_under_sop_group(): Promise<void>;
}
export {};
