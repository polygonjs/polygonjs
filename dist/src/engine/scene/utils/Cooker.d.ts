import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import { PolyScene } from '../PolyScene';
export declare class Cooker {
    private _scene;
    private _queue;
    private _block_level;
    private _process_item_bound;
    constructor(_scene: PolyScene);
    block(): void;
    unblock(): void;
    get blocked(): boolean;
    enqueue(node: CoreGraphNode, original_trigger_graph_node?: CoreGraphNode): void;
    process_queue(): void;
    private _process_item;
}
