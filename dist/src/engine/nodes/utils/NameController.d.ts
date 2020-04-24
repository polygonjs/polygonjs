import { BaseNodeType } from '../_Base';
import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
declare type Callback = () => void;
export declare class NameController {
    protected node: BaseNodeType;
    private _graph_node;
    private _on_set_name_hooks;
    private _on_set_full_path_hooks;
    constructor(node: BaseNodeType);
    get graph_node(): CoreGraphNode;
    static base_name(node: BaseNodeType): string;
    request_name_to_parent(new_name: string): void;
    set_name(new_name: string): void;
    update_name_from_parent(new_name: string): void;
    add_post_set_name_hook(hook: Callback): void;
    add_post_set_full_path_hook(hook: Callback): void;
    post_set_name(): void;
    post_set_full_path(): void;
}
export {};
