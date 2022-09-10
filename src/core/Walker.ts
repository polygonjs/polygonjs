import {Constructor} from './../types/GlobalTypes';
import {CoreGraphNode} from './graph/CoreGraphNode';
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

abstract class GraphNodePathParamValue<T extends CoreGraphNode> {
	protected _graphNode: T | null = null;
	constructor(protected _path: string = '') {}
	graphNode() {
		return this._graphNode;
	}
	private _setGraphNode(graphNode: T | null) {
		this._graphNode = graphNode;
	}
	abstract graphNodePath():string|undefined
	path() {
		return this._path;
	}
	setPath(path: string) {
		this._path = path;
	}
	clone(): this {
		const cloned = new (this.constructor as Constructor<GraphNodePathParamValue<T>>)(this._path);
		cloned._setGraphNode(this._graphNode);
		return cloned as this;
	}
}

export class TypedNodePathParamValue extends GraphNodePathParamValue<BaseNodeType> {
	setNode(node: BaseNodeType | null) {
		this._graphNode = node;
	}

	node() {
		return this._graphNode;
	}
	graphNodePath(){
		return this.node()?.path()
	}

	resolve(nodeStart: BaseNodeType) {
		this._graphNode = CoreWalker.findNode(nodeStart, this._path);
	}

	nodeWithContext<N extends NodeContext, K extends NodeContext>(
		context: N,
		errorState?: NodeErrorState<K>
	): BaseNodeByContextMap[N] | undefined {
		const foundNode = this.node();
		if (!foundNode) {
			errorState?.set(`no node found at ${this.path()}`);
			return;
		}
		const node_context = foundNode.context();
		if (node_context == context) {
			return foundNode as BaseNodeByContextMap[N];
		} else {
			errorState?.set(`expected ${context} node, but got a ${node_context}`);
			return;
		}
	}
}

export class TypedParamPathParamValue extends GraphNodePathParamValue<BaseParamType> {
	setParam(param: BaseParamType | null) {
		this._graphNode = param;
	}
	param() {
		return this._graphNode;
	}
	graphNodePath(){
		return this.param()?.path()
	}

	resolve(nodeStart: BaseNodeType) {
		this._graphNode = CoreWalker.findParam(nodeStart, this._path);
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

	static splitParentChild(path: string) {
		const elements: string[] = path.split(CoreWalker.SEPARATOR).filter((e) => e.length > 0);
		const child_path = elements.pop();
		const parent_path = elements.join(CoreWalker.SEPARATOR);
		return {parent: parent_path, child: child_path};
	}

	static findNode(node_src: BaseNodeType, path: string, decomposedPath?: DecomposedPath): BaseNodeType | null {
		if (!node_src) {
			return null;
		}

		const elements: string[] = path.split(CoreWalker.SEPARATOR).filter((e) => e.length > 0);
		const first_element = elements[0];

		let next_node: BaseNodeType | null = null;
		if (path[0] === CoreWalker.SEPARATOR) {
			const path_from_root = path.substring(1);
			next_node = this.findNode(node_src.root(), path_from_root, decomposedPath);
		} else {
			switch (first_element) {
				case CoreWalker.PARENT:
					decomposedPath?.add_path_element(first_element);
					next_node = node_src.parent();
					break;
				case CoreWalker.CURRENT:
					decomposedPath?.add_path_element(first_element);
					next_node = node_src;
					break;
				default:
					// TODO: What does .node means?? in which case is this not a node? (it is for nodes which cannot have children - but I'd like to unify the api)
					// console.error("rethink this method Walker.find_node")
					// if (node_src.node != null) {
					next_node = node_src.node(first_element);
					if (next_node) {
						decomposedPath?.add_node(first_element, next_node);
					}

				// if (next_node == null) { this.find_node_warning(node_src, first_element); }
				// return next_node;
				// break
				// }
			}

			if (next_node != null && elements.length > 1) {
				const remainder = elements.slice(1).join(CoreWalker.SEPARATOR);
				next_node = this.findNode(next_node, remainder, decomposedPath);
			}
			return next_node;
		}

		return next_node;
	}

	static findParam(node_src: BaseNodeType, path: string, decomposedPath?: DecomposedPath): BaseParamType | null {
		if (!node_src) {
			return null;
		}

		const elements = path.split(CoreWalker.SEPARATOR);

		if (elements.length === 1) {
			return node_src.params.get(elements[0]);
		} else {
			let node: BaseNodeType | null = null;
			if (path[0] === CoreWalker.SEPARATOR && elements.length == 2) {
				node = node_src.root();
			} else {
				const node_path = elements.slice(0, +(elements.length - 2) + 1 || undefined).join(CoreWalker.SEPARATOR);
				node = this.findNode(node_src, node_path, decomposedPath);
			}
			if (node != null) {
				const param_name = elements[elements.length - 1];
				const param = node.params.get(param_name);
				if (decomposedPath && param) {
					decomposedPath.add_node(param_name, param);
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
			return this.sanitizePath(`${up}${down}`);
		}
	}
	static sanitizePath(path: string) {
		return path.replace(/\/\//g, '/');
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

	static makeAbsolutePath(nodeSrc: BaseNodeType | BaseParamType, path: string): string | null {
		if (path[0] == CoreWalker.SEPARATOR) {
			return path;
		}
		const pathElements = path.split(CoreWalker.SEPARATOR);
		const firstElement = pathElements.shift();

		if (firstElement) {
			switch (firstElement) {
				case '..': {
					const parent = nodeSrc.parent();
					if (parent) {
						if (parent == nodeSrc.scene().root()) {
							return CoreWalker.SEPARATOR + pathElements.join(CoreWalker.SEPARATOR);
						} else {
							return this.makeAbsolutePath(parent, pathElements.join(CoreWalker.SEPARATOR));
						}
					} else {
						return null;
					}
				}
				case '.': {
					return this.makeAbsolutePath(nodeSrc, pathElements.join(CoreWalker.SEPARATOR));
				}
				default: {
					return [nodeSrc.path(), path].join(CoreWalker.SEPARATOR);
				}
			}
		} else {
			return nodeSrc.path();
		}
	}
}
