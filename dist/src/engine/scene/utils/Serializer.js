import {NodeSerializer} from "../../../engine/nodes/utils/Serializer";
export class PolySceneSerializer {
  constructor(scene) {
    this.scene = scene;
  }
  to_json(include_node_param_components = false) {
    const nodes_by_graph_node_id = {};
    const params_by_graph_node_id = {};
    for (let node of this.scene.nodes_controller.all_nodes()) {
      const node_serializer = new NodeSerializer(node);
      nodes_by_graph_node_id[node.graph_node_id] = node_serializer.to_json(include_node_param_components);
      const params = node.params.all;
      for (let param of params) {
        params_by_graph_node_id[param.graph_node_id] = param.to_json();
      }
    }
    return {
      nodes_by_graph_node_id,
      params_by_graph_node_id
    };
  }
}
