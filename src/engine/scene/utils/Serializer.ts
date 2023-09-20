// import {PolyScene} from '../PolyScene';
// // import {PolyDictionary} from '../../../types/GlobalTypes';

// export class PolySceneSerializer {
// 	constructor(protected scene: PolyScene) {}

// 	// toJSON(include_node_param_components: boolean = false) {
// 	// 	const nodes_by_graph_node_id: PolyDictionary<object> = {};
// 	// 	const params_by_graph_node_id: PolyDictionary<object> = {};

// 	// 	const allNodes = this.scene.nodesController.allNodes();
// 	// 	console.log(`allNodes`, allNodes);
// 	// 	for (const node of allNodes) {
// 	// 		const nodeSerializer = node.serializer; //new NodeSerializer(node);
// 	// 		if (nodeSerializer) {
// 	// 			nodes_by_graph_node_id[node.graphNodeId()] = nodeSerializer.toJSON(include_node_param_components);
// 	// 		} else {
// 	// 			console.warn(`no serializer for node ${node.path()}`);
// 	// 		}

// 	// 		const params = node.params.all;
// 	// 		for (const param of params) {
// 	// 			const paramJSON = param.toJSON();
// 	// 			if (paramJSON) {
// 	// 				params_by_graph_node_id[param.graphNodeId()] = paramJSON;
// 	// 			} else {
// 	// 				console.warn(`no json for param ${param.path()}`);
// 	// 			}
// 	// 		}
// 	// 	}

// 	// 	return {
// 	// 		nodes_by_graph_node_id,
// 	// 		params_by_graph_node_id,
// 	// 	};
// 	// }
// }
