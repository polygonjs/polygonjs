import { BaseNodeType } from '../../nodes/_Base';
export declare class CookController {
    private _cooking_nodes_by_id;
    private _resolves;
    constructor();
    add_node(node: BaseNodeType): void;
    remove_node(node: BaseNodeType): void;
    private flush;
    wait_for_cooks_completed(): Promise<void>;
}
