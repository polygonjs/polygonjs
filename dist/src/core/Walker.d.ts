import { BaseNodeType } from '../engine/nodes/_Base';
import { BaseParamType } from '../engine/params/_Base';
import { DecomposedPath } from './DecomposedPath';
import { NodeContext, BaseNodeByContextMap } from '../engine/poly/NodeContext';
import { ErrorState } from '../engine/nodes/utils/states/Error';
declare type NodeOrParam = BaseNodeType | BaseParamType;
export declare class TypedPathParamValue {
    private _path;
    static readonly DEFAULT: {
        UV: string;
        ENV_MAP: string;
    };
    private _node;
    constructor(_path?: string);
    set_path(path: string): void;
    set_node(node: BaseNodeType | null): void;
    path(): string;
    node(): BaseNodeType | null;
    resolve(node_start: BaseNodeType): void;
    clone(): TypedPathParamValue;
    ensure_node_context<N extends NodeContext>(context: N, error_state?: ErrorState): BaseNodeByContextMap[N] | undefined;
}
export declare class CoreWalker {
    static readonly SEPARATOR = "/";
    static readonly DOT = ".";
    static readonly CURRENT = ".";
    static readonly PARENT = "..";
    static readonly CURRENT_WITH_SLASH: string;
    static readonly PARENT_WITH_SLASH: string;
    static readonly NON_LETTER_PREFIXES: string[];
    static split_parent_child(path: string): {
        parent: string;
        child: string | undefined;
    };
    static find_node(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseNodeType | null;
    static find_param(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseParamType | null;
    static relative_path(src_graph_node: Readonly<NodeOrParam>, dest_graph_node: Readonly<NodeOrParam>): string;
    static closest_common_parent(graph_node1: Readonly<NodeOrParam>, graph_node2: Readonly<NodeOrParam>): BaseNodeType | null;
    static parents(graph_node: Readonly<NodeOrParam>): BaseNodeType[];
    static distance_to_parent(graph_node: Readonly<NodeOrParam>, dest: Readonly<BaseNodeType>): number;
    static make_absolute_path(node_src: BaseNodeType | BaseParamType, path: string): string | null;
}
export {};
