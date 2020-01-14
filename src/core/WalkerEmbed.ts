import {BaseNodeType} from 'src/engine/nodes/_Base';
// import {BaseParam} from 'src/engine/params/_Base'
import {DecomposedPath} from './DecomposedPath';

// type NodeOrParam = BaseNode | BaseParam

const SEPARATOR = '/';

export class CoreWalkerEmbed {
	static separator() {
		return SEPARATOR;
	}

	static find_node(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseNodeType | null {
		if (!node_src) {
			return null;
		}

		const elements: string[] = path.split(SEPARATOR).filter((e) => e.length > 0);
		const first_element = elements[0];

		let next_node: BaseNodeType | null = null;
		if (path[0] === '/') {
			const path_from_root = path.substr(1);
			next_node = this.find_node(node_src.root, path_from_root, decomposed_path);
		} else {
			switch (first_element) {
				case '..':
					next_node = node_src.parent;
					break;
				case '.':
					next_node = node_src;
					break;
				default:
					// TODO: What does .node means?? in which case is this not a node? (it is for nodes which cannot have children - but I'd like to unify the api)
					// console.log(first_element)
					// console.error("rethink this method Walker.find_node")
					// if (node_src.node != null) {
					next_node = node_src.node(first_element);

				// if (next_node == null) { this.find_node_warning(node_src, first_element); }
				// return next_node;
				// break
				// }
			}
			if (next_node && decomposed_path) {
				decomposed_path.add_node(first_element, next_node);
			}

			if (next_node != null && elements.length > 1) {
				const remainder = elements.slice(1).join(SEPARATOR);
				next_node = this.find_node(next_node, remainder, decomposed_path);
			}
			return next_node;
		}

		return next_node;
	}
}
