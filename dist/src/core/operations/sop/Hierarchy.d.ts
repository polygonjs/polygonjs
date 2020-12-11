import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface HierarchySopParams extends DefaultOperationParams {
    mode: number;
    levels: number;
}
export declare enum HierarchyMode {
    ADD_PARENT = "add_parent",
    REMOVE_PARENT = "remove_parent"
}
export declare const HIERARCHY_MODES: Array<HierarchyMode>;
export declare class HierarchySopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: HierarchySopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'hierarchy'>;
    cook(input_contents: CoreGroup[], params: HierarchySopParams): CoreGroup;
    private _add_parent_to_core_group;
    private _add_parent_to_object;
    private _add_new_parent;
    private _remove_parent_from_core_group;
    private _remove_parent_from_object;
    private _get_children_from_objects;
}
export {};
