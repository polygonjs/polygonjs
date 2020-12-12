import { TypedNode } from '../../../nodes/_Base';
import { SceneJsonImporter } from '../../../io/json/import/Scene';
import { NodeContext } from '../../../poly/NodeContext';
import { NodeJsonExporterData } from '../export/Node';
declare type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
interface RootNodeGenericData {
    outputs_count: number;
    non_optimized_count: number;
}
export declare class OptimizedNodesJsonImporter<T extends BaseNodeTypeWithIO> {
    protected _node: T;
    constructor(_node: T);
    private _nodes;
    private _optimized_root_node_names;
    private _operation_containers_by_name;
    nodes(): BaseNodeTypeWithIO[];
    process_data(scene_importer: SceneJsonImporter, data?: Dictionary<NodeJsonExporterData>): void;
    private _node_inputs;
    private _add_optimized_node_inputs;
    static child_names_by_optimized_state(data: Dictionary<NodeJsonExporterData>): {
        optimized_names: string[];
        non_optimized_names: string[];
    };
    static is_optimized_root_node_generic(data: RootNodeGenericData): boolean;
    static is_optimized_root_node(data: Dictionary<NodeJsonExporterData>, current_node_name: string): boolean;
    static is_optimized_root_node_from_node<NC extends NodeContext>(node: TypedNode<NC, any>): boolean;
    static node_outputs(data: Dictionary<NodeJsonExporterData>, current_node_name: string): Set<string>;
    private _create_operation_container;
    static operation_type(node_data: NodeJsonExporterData): string;
    static is_node_optimized(node_data: NodeJsonExporterData): boolean;
    static is_node_bypassed(node_data: NodeJsonExporterData): boolean;
}
export {};
