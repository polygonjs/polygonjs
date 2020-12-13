import { BaseParamType } from '../params/_Base';
import { CoreGraphNode } from '../../core/graph/CoreGraphNode';
import jsep from 'jsep';
export declare class NamesListener extends CoreGraphNode {
    param: BaseParamType;
    node_simple: CoreGraphNode;
    jsep_node: jsep.Expression;
    constructor(param: BaseParamType, node_simple: CoreGraphNode, jsep_node: jsep.Expression);
    reset(): void;
    connect_to_nodes_in_path(): void;
    find_nodes_in_path(): void;
}
