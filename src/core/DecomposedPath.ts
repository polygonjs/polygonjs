import {BaseNode} from 'src/engine/nodes/_Base';
import {BaseParam} from 'src/engine/params/_Base';
import {CoreWalker} from 'src/core/Walker';
// import {NodeSimple} from 'src/core/Graph/NodeSimple'

// import {NamedGraphNodeClass} from './graph/NamedGraphNode'
type NodeOrParam = BaseNode | BaseParam;

const SEPARATOR = CoreWalker.SEPARATOR;
export class DecomposedPath {
	named_nodes: NodeOrParam[] = [];
	private graph_node_ids: string[] = [];
	private node_element_by_graph_node_id: StringsByString = {};

	constructor() {}
	add_node(name: string, node: NodeOrParam) {
		if (name == node.name) {
			this.named_nodes.push(node);
		}

		this.graph_node_ids.push(node.graph_node_id);
		this.node_element_by_graph_node_id[node.graph_node_id] = name;
	}

	update_from_name_change(node: NodeOrParam) {
		const named_graph_node_ids = this.named_nodes.map((n) => n.graph_node_id);

		if (named_graph_node_ids.includes(node.graph_node_id)) {
			this.node_element_by_graph_node_id[node.graph_node_id] = node.name;
		}
	}

	to_path(): string {
		return this.graph_node_ids
			.map((graph_node_id) => {
				return this.node_element_by_graph_node_id[graph_node_id];
			})
			.join(SEPARATOR);
	}
}
