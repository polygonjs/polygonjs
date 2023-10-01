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
const _remainingElements: string[] = [];
const _ups: string[] = [];

abstract class GraphNodePathParamValue<T extends CoreGraphNode> {
	protected _graphNode: T | null = null;
	constructor(protected _path: string = '') {}
	graphNode() {
		return this._graphNode;
	}
	private _setGraphNode(graphNode: T | null) {
		this._graphNode = graphNode;
	}
	abstract graphNodePath(): string | undefined;
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
	graphNodePath() {
		return this.node()?.path();
	}

	resolve(nodeStart: BaseNodeType, decomposedPath?: DecomposedPath) {
		this._graphNode = CoreWalker.findNode(nodeStart, this._path, decomposedPath);
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
		const nodeContext = foundNode.context();
		if (nodeContext == context) {
			return foundNode as BaseNodeByContextMap[N];
		} else {
			errorState?.set(`expected ${context} node, but got a ${nodeContext}`);
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
	graphNodePath() {
		return this.param()?.path();
	}

	resolve(nodeStart: BaseNodeType, decomposedPath?: DecomposedPath) {
		this._graphNode = CoreWalker.findParam(nodeStart, this._path, decomposedPath);
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

	static findNode(nodeSrc: BaseNodeType, path: string, decomposedPath?: DecomposedPath): BaseNodeType | null {
		if (!nodeSrc) {
			return null;
		}

		const elements: string[] = path.split(CoreWalker.SEPARATOR).filter((e) => e.length > 0);
		const firstElement = elements[0];

		let nextNode: BaseNodeType | null = null;
		if (path[0] === CoreWalker.SEPARATOR) {
			const pathFromRoot = path.substring(1);
			nextNode = this.findNode(nodeSrc.root(), pathFromRoot, decomposedPath);
		} else {
			switch (firstElement) {
				case CoreWalker.PARENT:
					nextNode = nodeSrc.parent();
					if (nextNode) {
						decomposedPath?.addPathElement({path: firstElement, node: nextNode});
					}
					break;
				case CoreWalker.CURRENT:
					nextNode = nodeSrc;
					decomposedPath?.addPathElement({path: firstElement, node: nextNode});
					break;
				default:
					nextNode = nodeSrc.node(firstElement);
					if (nextNode) {
						decomposedPath?.addNamedNode({name: firstElement, node: nextNode});
					}
			}

			if (nextNode != null && elements.length > 1) {
				const remainder = elements.slice(1).join(CoreWalker.SEPARATOR);
				nextNode = this.findNode(nextNode, remainder, decomposedPath);
			}
			return nextNode;
		}

		return nextNode;
	}

	static findParam(nodeSrc: BaseNodeType, path: string, decomposedPath?: DecomposedPath): BaseParamType | null {
		if (!nodeSrc) {
			return null;
		}

		const elements = path.split(CoreWalker.SEPARATOR);

		if (elements.length === 1) {
			return nodeSrc.params.get(elements[0]);
		} else {
			let node: BaseNodeType | null = null;
			if (path[0] === CoreWalker.SEPARATOR && elements.length == 2) {
				node = nodeSrc.root();
			} else {
				const nodePath = elements.slice(0, +(elements.length - 2) + 1 || undefined).join(CoreWalker.SEPARATOR);
				node = this.findNode(nodeSrc, nodePath, decomposedPath);
			}
			if (node != null) {
				const paramName = elements[elements.length - 1];
				const param = node.params.get(paramName);
				if (decomposedPath && param) {
					decomposedPath.addNamedNode({name: paramName, node: param});
				}
				return param;
			} else {
				return null;
				// throw `no node found for path ${node_path}`;
			}
		}
	}
	static relativePath(srcGraphNode: Readonly<BaseNodeType>, destGraphNode: Readonly<BaseNodeType>): string {
		const parent = this.closestCommonParent(srcGraphNode, destGraphNode);
		if (!parent) {
			return destGraphNode.path();
		} else {
			const distance = this.distanceToParent(srcGraphNode, parent);
			let up = '';
			if (distance > 0) {
				let i = 0;
				_ups.length = 0;
				while (i++ < distance) {
					_ups.push(CoreWalker.PARENT);
				}
				up = _ups.join(CoreWalker.SEPARATOR) + CoreWalker.SEPARATOR;
			}

			const parent_path_elements = parent
				.path()
				.split(CoreWalker.SEPARATOR)
				.filter((e) => e.length > 0);
			const dest_path_elements = destGraphNode
				.path()
				.split(CoreWalker.SEPARATOR)
				.filter((e) => e.length > 0);
			_remainingElements.length = 0;
			let cmptr = 0;
			for (const dest_path_element of dest_path_elements) {
				if (!parent_path_elements[cmptr]) {
					_remainingElements.push(dest_path_element);
				}
				cmptr++;
			}
			const down = _remainingElements.join(CoreWalker.SEPARATOR);
			return this.sanitizePath(`${up}${down}`);
		}
	}
	static sanitizePath(path: string) {
		return path.replace(/\/\//g, '/');
	}

	static closestCommonParent(
		graphNode1: Readonly<BaseNodeType>,
		graphNode2: Readonly<BaseNodeType>
	): Readonly<BaseNodeType> | null {
		const parents1 = this.parents(graphNode1).reverse().concat([graphNode1]);
		const parents2 = this.parents(graphNode2).reverse().concat([graphNode2]);

		const minDepth = Math.min(parents1.length, parents2.length);
		let foundParent = null;

		for (let i = 0; i < minDepth; i++) {
			if (parents1[i].graphNodeId() == parents2[i].graphNodeId()) {
				foundParent = parents1[i];
			}
		}
		return foundParent;
	}
	static parents(graphNode: Readonly<NodeOrParam>): Readonly<BaseNodeType>[] {
		const parents = [];
		let parent = graphNode.parent();
		while (parent) {
			parents.push(parent);
			parent = parent.parent();
		}
		return parents;
	}
	static distanceToParent(graphNode: Readonly<NodeOrParam>, dest: Readonly<BaseNodeType>): number {
		let distance = 0;
		let current: Readonly<NodeOrParam | null> = graphNode;
		const destId = dest.graphNodeId();
		while (current && current.graphNodeId() != destId) {
			distance += 1;
			current = current.parent();
		}
		if (current && current.graphNodeId() == destId) {
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
