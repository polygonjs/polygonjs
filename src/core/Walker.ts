import {BaseNodeType} from '../engine/nodes/_Base';
import {BaseParamType} from '../engine/params/_Base';
import {DecomposedPath} from './DecomposedPath';
// import {NodeSimple} from '/graph/NodeSimple'

import {CoreWalkerEmbed} from './WalkerEmbed';

type NodeOrParam = BaseNodeType | BaseParamType;

export class CoreWalker extends CoreWalkerEmbed {
	public static readonly SEPARATOR = '/';
	public static readonly CURRENT = '.';
	public static readonly PARENT = '..';
	public static readonly CURRENT_WITH_SLASH = `${CoreWalker.CURRENT}/`;
	public static readonly PARENT_WITH_SLASH = `${CoreWalker.PARENT}/`;

	static find_param(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseParamType | null {
		if (!node_src) {
			return null;
		}

		const elements = path.split(CoreWalker.SEPARATOR);

		if (elements.length === 1) {
			return node_src.params.get(elements[0]);
		} else {
			const node_path = elements.slice(0, +(elements.length - 2) + 1 || undefined).join(CoreWalker.SEPARATOR);
			const node = this.find_node(node_src, node_path, decomposed_path);
			if (node != null) {
				const param_name = elements[elements.length - 1];
				const param = node.params.get(param_name);
				if (decomposed_path && param) {
					decomposed_path.add_node(param_name, param);
				}
				return param;
			} else {
				return null;
				// throw `no node found for path ${node_path}`;
			}
		}
	}
	static relative_path(src_graph_node: Readonly<NodeOrParam>, dest_graph_node: Readonly<NodeOrParam>): string {
		const parent = this.closest_common_parent(src_graph_node, dest_graph_node);
		if (!parent) {
			return dest_graph_node.full_path();
		} else {
			const distance = this.distance_to_parent(src_graph_node, parent);
			// const up = lodash_padStart("", (distance-1)*3, "../")
			let up = '';
			if (distance - 1 > 0) {
				let i = 0;
				const ups = [];
				while (i++ < distance - 1) {
					ups.push(CoreWalker.PARENT);
				}
				up = ups.join(CoreWalker.SEPARATOR) + CoreWalker.SEPARATOR;
			}

			const parent_path_elements = parent
				.full_path()
				.split(CoreWalker.SEPARATOR)
				.filter((e) => e.length > 0);
			const dest_path_elements = dest_graph_node
				.full_path()
				.split(CoreWalker.SEPARATOR)
				.filter((e) => e.length > 0);
			const remaining_elements = [];
			let cmptr = 0;
			for (let dest_path_element of dest_path_elements) {
				if (!parent_path_elements[cmptr]) {
					remaining_elements.push(dest_path_element);
				}
				cmptr++;
			}
			const down = remaining_elements.join(CoreWalker.SEPARATOR);
			return `${up}${down}`;
		}
	}

	static closest_common_parent(
		graph_node1: Readonly<NodeOrParam>,
		graph_node2: Readonly<NodeOrParam>
	): BaseNodeType | null {
		const parents1 = this.parents(graph_node1).reverse();
		const parents2 = this.parents(graph_node2).reverse();

		const min_depth = Math.min(parents1.length, parents2.length);
		let found_parent = null;

		for (let i = 0; i < min_depth; i++) {
			if (parents1[i].graph_node_id == parents2[i].graph_node_id) {
				found_parent = parents1[i];
			}
		}
		return found_parent;
	}
	static parents(graph_node: Readonly<NodeOrParam>): BaseNodeType[] {
		const parents = [];
		let parent = graph_node.parent;
		while (parent) {
			parents.push(parent);
			parent = parent.parent;
		}
		return parents;
	}
	static distance_to_parent(graph_node: Readonly<NodeOrParam>, dest: Readonly<BaseNodeType>): number {
		let distance = 0;
		let current: Readonly<NodeOrParam | null> = graph_node;
		const dest_id = dest.graph_node_id;
		while (current && current.graph_node_id != dest_id) {
			distance += 1;
			current = current.parent;
		}
		if (current && current.graph_node_id == dest_id) {
			return distance;
		} else {
			return -1;
		}
	}
	// static make_absolute(node_src: BaseNode, path: string): string {
	// 	return ""
	// }
}
