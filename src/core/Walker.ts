import {BaseNodeType} from '../engine/nodes/_Base';
import {BaseParamType} from '../engine/params/_Base';
import {DecomposedPath} from './DecomposedPath';
import {NodeContext, BaseNodeByContextMap} from '../engine/poly/NodeContext';
import {NodeErrorState} from '../engine/nodes/utils/states/Error';
import {ParamType} from '../engine/poly/ParamType';
import {ParamErrorState} from '../engine/params/utils/states/Error';
import {ParamConstructorMap} from '../engine/params/types/ParamConstructorMap';

type NodeOrParam = BaseNodeType | BaseParamType;

export const NODE_PATH_DEFAULT = {
	NODE: {
		EMPTY: '',
		UV: '/COP/imageUv',
		ENV_MAP: '/COP/envMap',
		CUBE_MAP: '/COP/cubeCamera',
	},
};

export class TypedNodePathParamValue {
	private _node: BaseNodeType | null = null;
	constructor(private _path: string = '') {}
	set_path(path: string) {
		this._path = path;
	}
	set_node(node: BaseNodeType | null) {
		this._node = node;
	}
	path() {
		return this._path;
	}
	node() {
		return this._node;
	}

	resolve(node_start: BaseNodeType) {
		this._node = CoreWalker.findNode(node_start, this._path);
	}

	clone() {
		const cloned = new TypedNodePathParamValue(this._path);
		cloned.set_node(this._node);
		return cloned;
	}

	nodeWithContext<N extends NodeContext>(
		context: N,
		error_state?: NodeErrorState<N>
	): BaseNodeByContextMap[N] | undefined {
		const found_node = this.node();
		if (!found_node) {
			error_state?.set(`no node found at ${this.path()}`);
			return;
		}
		const node_context = found_node.context();
		if (node_context == context) {
			return found_node as BaseNodeByContextMap[N];
		} else {
			error_state?.set(`expected ${context} node, but got a ${node_context}`);
			return;
		}
	}
}

export class TypedParamPathParamValue {
	private _param: BaseParamType | null = null;
	constructor(private _path: string = '') {}
	set_path(path: string) {
		this._path = path;
	}
	set_param(param: BaseParamType | null) {
		this._param = param;
	}
	path() {
		return this._path;
	}
	param() {
		return this._param;
	}

	resolve(node_start: BaseNodeType) {
		this._param = CoreWalker.findParam(node_start, this._path);
	}

	clone() {
		const cloned = new TypedParamPathParamValue(this._path);
		cloned.set_param(this._param);
		return cloned;
	}

	paramWithType<T extends ParamType>(
		paramType: T,
		error_state?: ParamErrorState
	): ParamConstructorMap[T] | undefined {
		const foundParam = this.param();
		if (!foundParam) {
			error_state?.set(`no param found at ${this.path()}`);
			return;
		}
		if (foundParam.type() == paramType) {
			return foundParam as ParamConstructorMap[T];
		} else {
			error_state?.set(`expected ${paramType} node, but got a ${foundParam.type()}`);
			return;
		}
	}
}

export class CoreWalker {
	public static readonly SEPARATOR = '/';
	public static readonly DOT = '.';
	public static readonly CURRENT = CoreWalker.DOT;
	public static readonly PARENT = '..';
	public static readonly CURRENT_WITH_SLASH = `${CoreWalker.CURRENT}/`;
	public static readonly PARENT_WITH_SLASH = `${CoreWalker.PARENT}/`;
	public static readonly NON_LETTER_PREFIXES = [CoreWalker.SEPARATOR, CoreWalker.DOT];

	static split_parent_child(path: string) {
		const elements: string[] = path.split(CoreWalker.SEPARATOR).filter((e) => e.length > 0);
		const child_path = elements.pop();
		const parent_path = elements.join(CoreWalker.SEPARATOR);
		return {parent: parent_path, child: child_path};
	}

	static findNode(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseNodeType | null {
		if (!node_src) {
			return null;
		}

		const elements: string[] = path.split(CoreWalker.SEPARATOR).filter((e) => e.length > 0);
		const first_element = elements[0];

		let next_node: BaseNodeType | null = null;
		if (path[0] === CoreWalker.SEPARATOR) {
			const path_from_root = path.substr(1);
			next_node = this.findNode(node_src.root(), path_from_root, decomposed_path);
		} else {
			switch (first_element) {
				case CoreWalker.PARENT:
					decomposed_path?.add_path_element(first_element);
					next_node = node_src.parent();
					break;
				case CoreWalker.CURRENT:
					decomposed_path?.add_path_element(first_element);
					next_node = node_src;
					break;
				default:
					// TODO: What does .node means?? in which case is this not a node? (it is for nodes which cannot have children - but I'd like to unify the api)
					// console.error("rethink this method Walker.find_node")
					// if (node_src.node != null) {
					next_node = node_src.node(first_element);
					if (next_node) {
						decomposed_path?.add_node(first_element, next_node);
					}

				// if (next_node == null) { this.find_node_warning(node_src, first_element); }
				// return next_node;
				// break
				// }
			}

			if (next_node != null && elements.length > 1) {
				const remainder = elements.slice(1).join(CoreWalker.SEPARATOR);
				next_node = this.findNode(next_node, remainder, decomposed_path);
			}
			return next_node;
		}

		return next_node;
	}

	static findParam(node_src: BaseNodeType, path: string, decomposed_path?: DecomposedPath): BaseParamType | null {
		if (!node_src) {
			return null;
		}

		const elements = path.split(CoreWalker.SEPARATOR);

		if (elements.length === 1) {
			return node_src.params.get(elements[0]);
		} else {
			const node_path = elements.slice(0, +(elements.length - 2) + 1 || undefined).join(CoreWalker.SEPARATOR);
			const node = this.findNode(node_src, node_path, decomposed_path);
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
	static relativePath(src_graph_node: Readonly<BaseNodeType>, dest_graph_node: Readonly<BaseNodeType>): string {
		const parent = this.closestCommonParent(src_graph_node, dest_graph_node);
		if (!parent) {
			return dest_graph_node.path();
		} else {
			const distance = this.distanceToParent(src_graph_node, parent);
			let up = '';
			if (distance > 0) {
				let i = 0;
				const ups = [];
				while (i++ < distance) {
					ups.push(CoreWalker.PARENT);
				}
				up = ups.join(CoreWalker.SEPARATOR) + CoreWalker.SEPARATOR;
			}

			const parent_path_elements = parent
				.path()
				.split(CoreWalker.SEPARATOR)
				.filter((e) => e.length > 0);
			const dest_path_elements = dest_graph_node
				.path()
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

	static closestCommonParent(
		graph_node1: Readonly<BaseNodeType>,
		graph_node2: Readonly<BaseNodeType>
	): Readonly<BaseNodeType> | null {
		const parents1 = this.parents(graph_node1).reverse().concat([graph_node1]);
		const parents2 = this.parents(graph_node2).reverse().concat([graph_node2]);

		const min_depth = Math.min(parents1.length, parents2.length);
		let found_parent = null;

		for (let i = 0; i < min_depth; i++) {
			if (parents1[i].graphNodeId() == parents2[i].graphNodeId()) {
				found_parent = parents1[i];
			}
		}
		return found_parent;
	}
	static parents(graph_node: Readonly<NodeOrParam>): Readonly<BaseNodeType>[] {
		const parents = [];
		let parent = graph_node.parent();
		while (parent) {
			parents.push(parent);
			parent = parent.parent();
		}
		return parents;
	}
	static distanceToParent(graph_node: Readonly<NodeOrParam>, dest: Readonly<BaseNodeType>): number {
		let distance = 0;
		let current: Readonly<NodeOrParam | null> = graph_node;
		const dest_id = dest.graphNodeId();
		while (current && current.graphNodeId() != dest_id) {
			distance += 1;
			current = current.parent();
		}
		if (current && current.graphNodeId() == dest_id) {
			return distance;
		} else {
			return -1;
		}
	}

	static makeAbsolutePath(node_src: BaseNodeType | BaseParamType, path: string): string | null {
		if (path[0] == CoreWalker.SEPARATOR) {
			return path;
		}

		const path_elements = path.split(CoreWalker.SEPARATOR);
		const first_element = path_elements.shift();

		if (first_element) {
			switch (first_element) {
				case '..': {
					const parent = node_src.parent();
					if (parent) {
						return this.makeAbsolutePath(parent, path_elements.join(CoreWalker.SEPARATOR));
					} else {
						return null;
					}
				}
				case '.': {
					return this.makeAbsolutePath(node_src, path_elements.join(CoreWalker.SEPARATOR));
				}
				default: {
					return [node_src.path(), path].join(CoreWalker.SEPARATOR);
				}
			}
		} else {
			return node_src.path();
		}
	}
}
