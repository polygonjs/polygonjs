import { BaseNodeType } from '../_Base';
import { BaseParamType } from '../../params/_Base';
export declare class DependenciesController {
    protected node: BaseNodeType;
    private _params_referrees_by_graph_node_id;
    constructor(node: BaseNodeType);
    scene_successors(): BaseNodeType[];
    scene_predecessors(): BaseNodeType[];
    private _find_scene_node_scene_nodes;
    private _find_base_nodes_from_node;
    add_param_referree(param: BaseParamType): void;
    remove_param_referree(param: BaseParamType): void;
    params_referree(): BaseParamType[];
    param_nodes_referree(): BaseNodeType[];
}
