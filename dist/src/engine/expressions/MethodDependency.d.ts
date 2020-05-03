import { DecomposedPath } from '../../core/DecomposedPath';
import { CoreGraphNode } from '../../core/graph/CoreGraphNode';
import { BaseParamType } from '../params/_Base';
import jsep from 'jsep';
export declare class MethodDependency extends CoreGraphNode {
    param: BaseParamType;
    path_argument: number | string;
    decomposed_path?: DecomposedPath | undefined;
    jsep_node: jsep.Expression | undefined;
    resolved_graph_node: CoreGraphNode | undefined;
    unresolved_path: string | undefined;
    private _update_from_name_change_bound;
    constructor(param: BaseParamType, path_argument: number | string, decomposed_path?: DecomposedPath | undefined);
    _update_from_name_change(trigger?: CoreGraphNode): void;
    reset(): void;
    listen_for_name_changes(): void;
    set_jsep_node(jsep_node: jsep.Expression): void;
    set_resolved_graph_node(node: CoreGraphNode): void;
    set_unresolved_path(path: string): void;
    static create(param: BaseParamType, index_or_path: number | string, node: CoreGraphNode, decomposed_path?: DecomposedPath): MethodDependency;
}
