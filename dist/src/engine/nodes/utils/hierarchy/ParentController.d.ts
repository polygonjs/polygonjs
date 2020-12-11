import { BaseNodeType } from '../../_Base';
export declare class HierarchyParentController {
    protected node: BaseNodeType;
    private _parent;
    private _on_set_parent_hooks;
    constructor(node: BaseNodeType);
    get parent(): BaseNodeType | null;
    set_parent(parent: BaseNodeType | null): void;
    is_selected(): boolean;
    full_path(relative_to_parent?: BaseNodeType): string;
    on_set_parent(): void;
    find_node(path: string | null): BaseNodeType | null;
}
