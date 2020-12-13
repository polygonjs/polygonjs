import { PolyScene } from '../PolyScene';
export declare class PolySceneSerializer {
    private scene;
    constructor(scene: PolyScene);
    to_json(include_node_param_components?: boolean): {
        nodes_by_graph_node_id: Dictionary<object>;
        params_by_graph_node_id: Dictionary<object>;
    };
}
