// import lodash_values from 'lodash/values'
// import lodash_concat from 'lodash/concat'
// import lodash_compact from 'lodash/compact'
import {PolyScene} from 'src/engine/scene/PolyScene'

export function Json<TBase extends Constructor>(Base: TBase) {
	return class extends Base {
		protected self: PolyScene = (<unknown>this) as PolyScene
		to_json(include_node_param_components: boolean = false) {
			const nodes_by_graph_node_id: Dictionary<object> = {}
			const params_by_graph_node_id: Dictionary<object> = {}

			for (let node of this.self.all_nodes()) {
				nodes_by_graph_node_id[node.graph_node_id()] = node.to_json(include_node_param_components)

				const params = node.all_params() //lodash_compact(lodash_concat( lodash_values(node.params()), lodash_values(node.spare_params()) ));
				for (let param of params) {
					params_by_graph_node_id[param.graph_node_id()] = param.to_json()
				}
			}

			return {
				nodes_by_graph_node_id,
				params_by_graph_node_id,
			}
		}
	}
}
