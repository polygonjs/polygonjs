// import {BaseNode} from 'src/Engine/Node/_Base'
// import {BaseParam} from 'src/Engine/Param/_Base'
// import {NodeSimple} from 'src/Core/Graph/NodeSimple'

import {NamedGraphNodeClass} from './graph/NamedGraphNode'
// type NodeOrParam = NamedGraphNode

const SEPARATOR = '/'
export class DecomposedPath {
	named_nodes: NamedGraphNodeClass[] = []
	private graph_node_ids: string[] = []
	private node_element_by_graph_node_id: StringsByString = {}

	constructor() {}
	add_node(name: string, node: NamedGraphNodeClass) {
		if (name == node.name()) {
			this.named_nodes.push(node)
		}

		this.graph_node_ids.push(node.graph_node_id())
		this.node_element_by_graph_node_id[node.graph_node_id()] = name
	}

	update_from_name_change(node: NamedGraphNodeClass) {
		const named_graph_node_ids = this.named_nodes.map((n) => {
			return n.graph_node_id()
		})

		if (named_graph_node_ids.includes(node.graph_node_id())) {
			this.node_element_by_graph_node_id[
				node.graph_node_id()
			] = node.name()
		}
	}

	to_path(): string {
		return this.graph_node_ids
			.map((graph_node_id) => {
				return this.node_element_by_graph_node_id[graph_node_id]
			})
			.join(SEPARATOR)
	}
}
