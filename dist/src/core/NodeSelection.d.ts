import { BaseNodeType } from '../engine/nodes/_Base';
import { CoreGraphNodeId } from './graph/CoreGraph';
export declare class CoreNodeSelection {
    private _node;
    _node_ids: CoreGraphNodeId[];
    constructor(_node: BaseNodeType);
    node(): BaseNodeType;
    nodes(): BaseNodeType[];
    contains(node: BaseNodeType): boolean;
    equals(nodes: BaseNodeType[]): boolean;
    clear(): void;
    set(nodes: BaseNodeType[]): void;
    add(nodes_to_add: BaseNodeType[]): void;
    remove(nodes_to_remove: BaseNodeType[]): void;
    private send_update_event;
    private _json;
    to_json(): number[];
}
