import { DecomposedPath } from '../../../core/DecomposedPath';
import { BaseParamType } from '../../params/_Base';
import { BaseNodeType } from '../../nodes/_Base';
import { MethodDependency } from '../MethodDependency';
import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import { BaseContainer } from '../../containers/_Base';
export declare class BaseMethod {
    readonly param: BaseParamType;
    protected _require_dependency: boolean;
    require_dependency(): boolean;
    constructor(param: BaseParamType);
    private _node;
    protected get node(): BaseNodeType | undefined;
    static required_arguments(): any[];
    static optional_arguments(): any[];
    static min_allowed_arguments_count(): number;
    static max_allowed_arguments_count(): number;
    static allowed_arguments_count(count: number): boolean;
    process_arguments(args: any): Promise<any>;
    get_referenced_node_container(index_or_path: number | string): Promise<BaseContainer>;
    get_referenced_param(path: string, decomposed_path?: DecomposedPath): BaseParamType | null;
    find_referenced_graph_node(index_or_path: number | string, decomposed_path?: DecomposedPath): CoreGraphNode | null;
    get_referenced_node(index_or_path: string | number, decomposed_path?: DecomposedPath): BaseNodeType | null;
    find_dependency(args: any): MethodDependency | null;
    protected create_dependency_from_index_or_path(index_or_path: number | string): MethodDependency | null;
    protected create_dependency(node: CoreGraphNode, index_or_path: number | string, decomposed_path?: DecomposedPath): MethodDependency | null;
}
