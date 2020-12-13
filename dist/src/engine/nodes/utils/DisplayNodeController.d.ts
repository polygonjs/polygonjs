import { BaseNodeClassWithDisplayFlag, BaseNodeType } from '../_Base';
export interface DisplayNodeControllerCallbacks {
    on_display_node_remove: () => void;
    on_display_node_set: () => void;
    on_display_node_update: () => void;
}
export declare class DisplayNodeController {
    protected node: BaseNodeType;
    private _initialized;
    private _graph_node;
    private _display_node;
    private _on_display_node_remove_callback;
    private _on_display_node_set_callback;
    private _on_display_node_update_callback;
    constructor(node: BaseNodeType, callbacks: DisplayNodeControllerCallbacks);
    get display_node(): BaseNodeClassWithDisplayFlag | undefined;
    initialize_node(): void;
    set_display_node(new_display_node: BaseNodeClassWithDisplayFlag | undefined): Promise<void>;
}
