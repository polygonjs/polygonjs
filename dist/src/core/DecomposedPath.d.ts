import { BaseNodeType } from '../engine/nodes/_Base';
import { BaseParamType } from '../engine/params/_Base';
declare type NodeOrParam = BaseNodeType | BaseParamType;
export declare class DecomposedPath {
    private index;
    private path_elements;
    private _named_nodes;
    private graph_node_ids;
    private node_element_by_graph_node_id;
    constructor();
    add_node(name: string, node: NodeOrParam): void;
    add_path_element(path_element: string): void;
    get named_nodes(): (BaseParamType | BaseNodeType | null)[];
    update_from_name_change(node: NodeOrParam): void;
    to_path(): string;
}
export {};
