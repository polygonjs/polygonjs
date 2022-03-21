import {PolyDictionary} from '../../../types/GlobalTypes';
import {PolyScene} from '../PolyScene';
import {RootManagerNode, ROOT_NODE_NAME} from '../../nodes/manager/Root';
import {CoreString} from '../../../core/String';
import {BaseNodeType} from '../../nodes/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeChildrenMapByContext} from '../../poly/registers/nodes/All';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

type NodeByNodeId = Map<CoreGraphNodeId, BaseNodeType>;
type NodeMapByType<NC extends NodeContext> = Map<keyof NodeChildrenMapByContext[NC], NodeByNodeId>;
export class NodesController {
	constructor(private scene: PolyScene) {}

	_root!: RootManagerNode;
	_nodeContextSignatures: PolyDictionary<boolean> = {};
	_instanciatedNodesByContextAndType: Map<NodeContext, NodeMapByType<NodeContext>> = new Map(); //PolyDictionary<PolyDictionary<PolyDictionary<BaseNodeType>>> = {};

	init() {
		this._root = new RootManagerNode(this.scene, ROOT_NODE_NAME);
		this._root.initializeBaseAndNode();
		this._root.params.init();
	}

	root() {
		return this._root;
	}
	private _traverseNode(parent: BaseNodeType, callback: (node: BaseNodeType) => void) {
		const nodes = parent.children();
		if (!nodes || nodes.length == 0) {
			return;
		}

		for (let node of nodes) {
			callback(node);

			if (node.childrenController) {
				this._traverseNode(node, callback);
			}
		}
	}

	// objectsFromMask(mask: string): Object3D[] {
	// 	const masks = mask.split(' ');
	// 	const child_nodes = this.root.children() as BaseObjNodeType[];
	// 	const objects: Object3D[] = [];
	// 	for (let child_node of child_nodes) {
	// 		if (CoreString.matchesOneMask(child_node.name, masks)) {
	// 			if (child_node.object) {
	// 				objects.push(child_node.object);
	// 			}
	// 		}
	// 	}
	// 	return objects;
	// }
	clear() {
		const children = this.root().children();
		for (let child of children) {
			this.root().childrenController?.removeNode(child);
		}
		// return children.forEach(child=> {
		// 	return this.root().removeNode(child);
		// });
	}

	node(path: string) {
		if (path === '/') {
			return this.root();
		} else {
			return this.root().node(path);
		}
	}
	allNodes() {
		let nodes: BaseNodeType[] = [this.root()];
		let current_parents: BaseNodeType[] = [this.root()];
		let cmptr = 0;
		while (current_parents.length > 0 && cmptr < 10) {
			const children = current_parents
				.map((current_parent) => {
					if (current_parent.childrenAllowed()) {
						return current_parent.children();
					} else {
						return [];
					}
				})
				.flat();
			nodes = nodes.concat(children);
			current_parents = children;
			cmptr += 1;
		}
		return nodes.flat();
	}
	nodesFromMask(mask: string) {
		const nodes = this.allNodes();
		const matching_nodes: BaseNodeType[] = [];
		for (let node of nodes) {
			const path = node.path();
			if (CoreString.matchMask(path, mask)) {
				matching_nodes.push(node);
			}
		}
		return matching_nodes;
	}

	resetNodeContextSignatures() {
		this._nodeContextSignatures = {};
	}
	registerNodeContextSignature(node: BaseNodeType) {
		if (node.childrenAllowed() && node.childrenController) {
			this._nodeContextSignatures[node.childrenController.nodeContextSignature()] = true;
		}
	}
	nodeContextSignatures() {
		return Object.keys(this._nodeContextSignatures)
			.sort()
			.map((s) => s.toLowerCase());
	}

	addToInstanciatedNode<NC extends NodeContext>(node: BaseNodeType) {
		const context = node.context() as NC;
		const nodeType = node.type() as keyof NodeChildrenMapByContext[NC];

		let mapForContext: NodeMapByType<NC> | undefined = this._instanciatedNodesByContextAndType.get(context);
		if (!mapForContext) {
			mapForContext = new Map() as NodeMapByType<NC>;
			this._instanciatedNodesByContextAndType.set(context, mapForContext as any);
		}
		let mapForType = mapForContext.get(nodeType);
		if (!mapForType) {
			mapForType = new Map() as NodeByNodeId;
			mapForContext.set(nodeType, mapForType);
		}
		mapForType.set(node.graphNodeId(), node);

		// this._instanciated_nodes_by_context_and_type[context] =
		// 	this._instanciated_nodes_by_context_and_type[context] || {};
		// this._instanciated_nodes_by_context_and_type[context][node_type] =
		// 	this._instanciated_nodes_by_context_and_type[context][node_type] || {};
		// this._instanciated_nodes_by_context_and_type[context][node_type][node.graphNodeId()] = node;
	}

	removeFromInstanciatedNode<NC extends NodeContext>(node: BaseNodeType) {
		const context = node.context() as NC;
		const nodeType = node.type() as keyof NodeChildrenMapByContext[NC];
		const mapForContext: NodeMapByType<NC> | undefined = this._instanciatedNodesByContextAndType.get(context);
		if (!mapForContext) {
			return;
		}
		const mapForType = mapForContext.get(nodeType);
		if (!mapForType) {
			return;
		}
		mapForType.delete(node.graphNodeId());
		// delete this._instanciated_nodes_by_context_and_type[context][node_type][node.graphNodeId()];
	}
	nodesByType(type: string): BaseNodeType[] {
		const list: BaseNodeType[] = [];

		this._traverseNode(this.scene.root(), (node) => {
			if (node.type() == type) {
				list.push(node);
			}
		});

		return list;
	}

	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.ACTOR]>(
		context: NodeContext.ACTOR,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.ACTOR][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.ANIM]>(
		context: NodeContext.ANIM,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.ANIM][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.AUDIO]>(
		context: NodeContext.AUDIO,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.AUDIO][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.COP]>(
		context: NodeContext.COP,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.COP][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.EVENT]>(
		context: NodeContext.EVENT,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.EVENT][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.GL]>(
		context: NodeContext.GL,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.GL][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.JS]>(
		context: NodeContext.JS,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.JS][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.MAT]>(
		context: NodeContext.MAT,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.MAT][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.OBJ]>(
		context: NodeContext.OBJ,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.OBJ][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.POST]>(
		context: NodeContext.POST,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.POST][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.ROP]>(
		context: NodeContext.ROP,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.ROP][T][];
	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.SOP]>(
		context: NodeContext.SOP,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.SOP][T][];
	nodesByContextAndType<NC extends NodeContext>(context: NC, nodeType: string) {
		const nodes: BaseNodeType[] = [];
		const mapForContext: NodeMapByType<NC> | undefined = this._instanciatedNodesByContextAndType.get(context);
		if (mapForContext) {
			const mapForType = mapForContext.get(nodeType as any);
			if (mapForType) {
				mapForType.forEach((node) => {
					nodes.push(node);
				});
			}
		}
		return nodes;
	}
}
