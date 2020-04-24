import { BaseNodeType, TypedNode } from '../../_Base';
import { TypedAssembler } from './BaseAssembler';
import { ShaderName } from './ShaderName';
export declare class TypedNodeTraverser<T extends TypedNode<any, T, any>> {
    private _assembler;
    private _gl_parent_node;
    private _leaves_graph_id;
    private _graph_ids_by_shader_name;
    private _outputs_by_graph_id;
    private _depth_by_graph_id;
    private _graph_id_by_depth;
    private _graph;
    private _shader_name;
    constructor(_assembler: TypedAssembler<T>, _gl_parent_node: BaseNodeType);
    private reset;
    shader_names(): ShaderName[];
    input_names_for_shader_name(root_node: T, shader_name: ShaderName): string[];
    traverse(root_nodes: T[]): void;
    leaves_from_nodes(nodes: T[]): T[];
    nodes_for_shader_name(shader_name: ShaderName): T[];
    sorted_nodes(): T[];
    private find_leaves_from_root_node;
    private find_leaves;
    private set_nodes_depth;
    private set_node_depth;
}
