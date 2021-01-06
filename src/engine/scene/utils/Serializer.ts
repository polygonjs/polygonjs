import {PolyScene} from '../PolyScene';
import {NodeSerializer} from '../../../engine/nodes/utils/Serializer';
import {PolyDictionary} from '../../../types/GlobalTypes';

export class PolySceneSerializer {
	constructor(private scene: PolyScene) {}

	toJSON(include_node_param_components: boolean = false) {
		const nodes_by_graph_node_id: PolyDictionary<object> = {};
		const params_by_graph_node_id: PolyDictionary<object> = {};

		for (let node of this.scene.nodesController.allNodes()) {
			const node_serializer = new NodeSerializer(node);
			nodes_by_graph_node_id[node.graph_node_id] = node_serializer.toJSON(include_node_param_components);

			const params = node.params.all;
			for (let param of params) {
				params_by_graph_node_id[param.graph_node_id] = param.toJSON();
			}
		}

		return {
			nodes_by_graph_node_id,
			params_by_graph_node_id,
		};
	}
}
