import {BaseNodeType} from '../engine/nodes/_Base';
import {BaseParamType} from '../engine/params/_Base';
import {CoreWalker} from './Walker';
import {CoreGraphNodeId} from './graph/CoreGraph';
type NodeOrParam = BaseNodeType | BaseParamType;

export class DecomposedPath {
	private _index = -1;
	private _path_elements: (string | null)[] = [];
	private _named_nodes: (NodeOrParam | null)[] = [];
	private _graph_node_ids: CoreGraphNodeId[] = [];
	private _node_element_by_graph_node_id: Map<CoreGraphNodeId, string> = new Map();

	constructor() {}
	reset() {
		this._index = -1;
		this._path_elements = [];
		this._named_nodes = [];
		this._graph_node_ids = [];
		this._node_element_by_graph_node_id.clear();
	}

	add_node(name: string, node: NodeOrParam) {
		this._index += 1;
		if (name == node.name()) {
			this._named_nodes[this._index] = node;
		}

		this._graph_node_ids[this._index] = node.graphNodeId();
		this._node_element_by_graph_node_id.set(node.graphNodeId(), name);
	}
	add_path_element(path_element: string) {
		this._index += 1;
		this._path_elements[this._index] = path_element;
	}

	named_graph_nodes() {
		return this._named_nodes;
	}
	named_nodes() {
		const nodes: BaseNodeType[] = [];
		for (let graph_node of this._named_nodes) {
			if (graph_node) {
				const node = graph_node as BaseNodeType;
				if (node.nameController) {
					nodes.push(node);
				}
			}
		}
		return nodes;
	}

	update_from_name_change(node: NodeOrParam) {
		const named_graph_node_ids = this._named_nodes.map((n) => n?.graphNodeId());

		if (named_graph_node_ids.includes(node.graphNodeId())) {
			this._node_element_by_graph_node_id.set(node.graphNodeId(), node.name());
		}
	}

	to_path(): string {
		const elements = new Array<string>(this._index);
		for (let i = 0; i <= this._index; i++) {
			const node = this._named_nodes[i];
			if (node) {
				const node_name = this._node_element_by_graph_node_id.get(node.graphNodeId());
				if (node_name) {
					elements[i] = node_name;
				}
			} else {
				const path_element = this._path_elements[i];
				if (path_element) {
					elements[i] = path_element;
				}
			}
		}

		let joined_path = elements.join(CoreWalker.SEPARATOR);
		// if the first character is a letter, we need to prefix with /
		const first_char = joined_path[0];
		if (first_char) {
			if (!CoreWalker.NON_LETTER_PREFIXES.includes(first_char)) {
				joined_path = `${CoreWalker.SEPARATOR}${joined_path}`;
			}
		}
		return joined_path;
	}
}
