import {BaseNodeType} from '../engine/nodes/_Base';
import {BaseParamType} from '../engine/params/_Base';
import {CoreWalker} from './Walker';
import {CoreGraphNodeId} from './graph/CoreGraph';
type NodeOrParam = BaseNodeType | BaseParamType;

interface PathElement {
	path: string;
	node: NodeOrParam;
}
interface NamedNode {
	name: string;
	node: NodeOrParam;
}
export class DecomposedPath {
	private _index = -1;
	private _pathElements: Array<PathElement | null> = [];
	private _namedNodes: Array<NamedNode | null> = [];
	private _graphNodeIds: CoreGraphNodeId[] = [];
	private _nodeElementByGraphNodeId: Map<CoreGraphNodeId, string> = new Map();
	private _absolutePath: string = '/';

	constructor() {}
	reset() {
		this._index = -1;
		this._pathElements = [];
		this._namedNodes = [];
		this._graphNodeIds = [];
		this._nodeElementByGraphNodeId.clear();
	}

	addNamedNode(namedNode: NamedNode) {
		this._index += 1;
		if (namedNode.name == namedNode.node.name()) {
			this._namedNodes[this._index] = namedNode;
		}

		this._graphNodeIds[this._index] = namedNode.node.graphNodeId();
		this._nodeElementByGraphNodeId.set(namedNode.node.graphNodeId(), namedNode.name);
		this._absolutePath = [this._absolutePath, namedNode.name].join(CoreWalker.SEPARATOR);
	}
	addPathElement(pathElement: PathElement) {
		this._index += 1;
		this._pathElements[this._index] = pathElement;
		if (pathElement.node) {
			this._absolutePath = pathElement.node.path();
		}
	}

	namedGraphNodes() {
		return this._namedNodes;
	}
	namedNodes(target: BaseNodeType[]) {
		target.length = 0;
		for (const namedNode of this._namedNodes) {
			if (namedNode) {
				const node = namedNode.node as BaseNodeType;
				if (node.nameController) {
					target.push(node);
				}
			}
		}
		return target;
	}

	updateFromNameChange(node: NodeOrParam) {
		const namedGraphNodeIds = this._namedNodes.map((n) => n?.node.graphNodeId());

		if (namedGraphNodeIds.includes(node.graphNodeId())) {
			this._nodeElementByGraphNodeId.set(node.graphNodeId(), node.name());
		}
	}

	toPath(): string {
		const elements = new Array<string>(this._index);
		for (let i = 0; i <= this._index; i++) {
			const namedNode = this._namedNodes[i];
			if (namedNode) {
				const nodeName = this._nodeElementByGraphNodeId.get(namedNode.node.graphNodeId());
				if (nodeName) {
					elements[i] = nodeName;
				}
			} else {
				const pathElement = this._pathElements[i];
				if (pathElement) {
					elements[i] = pathElement.path;
				}
			}
		}

		let joinedPath = elements.join(CoreWalker.SEPARATOR);
		// if the first character is a letter, we need to prefix with /
		const firstChar = joinedPath[0];
		if (firstChar) {
			if (!CoreWalker.NON_LETTER_PREFIXES.includes(firstChar)) {
				joinedPath = `${CoreWalker.SEPARATOR}${joinedPath}`;
			}
		}
		return joinedPath;
	}
	toAbsolutePath(): string {
		return this._absolutePath;
	}
}
