import {BaseNode} from 'src/engine/nodes/_Base'
import {BaseParam} from 'src/engine/params/_Base'
import {DecomposedPath} from './DecomposedPath'
// import {NodeSimple} from 'src/core/graph/NodeSimple'

import {CoreWalkerEmbed} from './WalkerEmbed'

type NodeOrParam = BaseNode | BaseParam

const SEPARATOR = '/'

export class CoreWalker extends CoreWalkerEmbed {
	static find_param(
		node_src: BaseNode,
		path: string,
		decomposed_path?: DecomposedPath
	): BaseParam {
		if (!node_src) {
			return
		}

		const elements = path.split(SEPARATOR)

		if (elements.length === 1) {
			return node_src.param(elements[0])
		} else {
			const node_path = elements
				.slice(0, +(elements.length - 2) + 1 || undefined)
				.join(SEPARATOR)
			const node = this.find_node(node_src, node_path, decomposed_path)
			if (node != null) {
				const param_name = elements[elements.length - 1]
				const param = node.param(param_name)
				if (decomposed_path) {
					decomposed_path.add_node(param_name, param)
				}
				return param
			} else {
				return null
				// throw `no node found for path ${node_path}`;
			}
		}
	}
	static relative_path(
		src_graph_node: NodeOrParam,
		dest_graph_node: NodeOrParam
	): string {
		const parent = this.closest_common_parent(
			src_graph_node,
			dest_graph_node
		)
		const distance = this.distance_to_parent(src_graph_node, parent)
		// const up = lodash_padStart("", (distance-1)*3, "../")
		let up = ''
		if (distance - 1 > 0) {
			let i = 0
			const ups = []
			while (i++ < distance - 1) {
				ups.push('..')
			}
			up = ups.join('/') + '/'
		}

		const parent_path_elements = parent
			.full_path()
			.split('/')
			.filter((e) => e.length > 0)
		const dest_path_elements = dest_graph_node
			.full_path()
			.split('/')
			.filter((e) => e.length > 0)
		const remaining_elements = []
		let cmptr = 0
		for (let dest_path_element of dest_path_elements) {
			if (!parent_path_elements[cmptr]) {
				remaining_elements.push(dest_path_element)
			}
			cmptr++
		}
		const down = remaining_elements.join('/')
		return `${up}${down}`
	}

	static closest_common_parent(
		graph_node1: NodeOrParam,
		graph_node2: NodeOrParam
	): BaseNode {
		const parents1 = this.parents(graph_node1).reverse()
		const parents2 = this.parents(graph_node2).reverse()

		const min_depth = Math.min(parents1.length, parents2.length)
		let found_parent = null

		for (let i = 0; i < min_depth; i++) {
			if (parents1[i].graph_node_id() == parents2[i].graph_node_id()) {
				found_parent = parents1[i]
			}
		}
		return found_parent
	}
	static parents(graph_node: NodeOrParam): BaseNode[] {
		const parents = []
		let parent = graph_node.parent()
		while (parent) {
			parents.push(parent)
			parent = parent.parent()
		}
		return parents
	}
	static distance_to_parent(graph_node: NodeOrParam, dest: BaseNode): number {
		let distance = 0
		let current = graph_node
		const dest_id = dest.graph_node_id()
		while (current && current.graph_node_id() != dest_id) {
			distance += 1
			current = current.parent()
		}
		if (current.graph_node_id() == dest_id) {
			return distance
		} else {
			return -1
		}
	}
	// static make_absolute(node_src: BaseNode, path: string): string {
	// 	return ""
	// }
}
