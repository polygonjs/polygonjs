import { CoreGraphNode } from './CoreGraphNode';
export declare type PostDirtyHook = (caller?: CoreGraphNode) => void;
export declare class DirtyController {
    private node;
    _dirty_count: number;
    _dirty: boolean;
    _dirty_timestamp: number | undefined;
    _cached_successors: CoreGraphNode[] | undefined;
    _forbidden_trigger_nodes: string[] | undefined;
    _post_dirty_hooks: PostDirtyHook[] | undefined;
    _post_dirty_hook_names: string[] | undefined;
    constructor(node: CoreGraphNode);
    get is_dirty(): boolean;
    get dirty_timestamp(): number | undefined;
    get dirty_count(): number;
    add_post_dirty_hook(name: string, method: PostDirtyHook): void;
    remove_post_dirty_hook(name: string): void;
    has_hook(name: string): boolean;
    remove_dirty_state(): void;
    set_forbidden_trigger_nodes(nodes: CoreGraphNode[]): void;
    set_dirty(original_trigger_graph_node?: CoreGraphNode | null, propagate?: boolean): void;
    run_post_dirty_hooks(original_trigger_graph_node?: CoreGraphNode): void;
    set_successors_dirty(original_trigger_graph_node?: CoreGraphNode): void;
    clear_successors_cache(): void;
    clear_successors_cache_with_predecessors(): void;
}
