import {PolyScene} from '../PolyScene';
import {NodeSerializer} from 'src/engine/nodes/utils/Serializer';

export class PolySceneSerializer {
	constructor(private scene: PolyScene) {}

	to_json(include_node_param_components: boolean = false) {
		const nodes_by_graph_node_id: Dictionary<object> = {};
		const params_by_graph_node_id: Dictionary<object> = {};

		for (let node of this.scene.nodes_controller.all_nodes()) {
			const node_serializer = new NodeSerializer(node);
			nodes_by_graph_node_id[node.graph_node_id] = node_serializer.to_json(include_node_param_components);

			const params = node.params.all; //lodash_compact(lodash_concat( lodash_values(node.params()), lodash_values(node.spare_params()) ));
			for (let param of params) {
				params_by_graph_node_id[param.graph_node_id] = param.to_json();
			}
		}

		return {
			nodes_by_graph_node_id,
			params_by_graph_node_id,
		};
	}
}
