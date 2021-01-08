import {PolyDictionary} from '../../../types/GlobalTypes';
import {PolyScene} from '../PolyScene';
import {ObjectsManagerNode} from '../../nodes/manager/ObjectsManager';
import {CoreString} from '../../../core/String';
import {BaseNodeType} from '../../nodes/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeChildrenMapByContext} from '../../poly/registers/nodes/All';

export class NodesController {
	constructor(private scene: PolyScene) {}

	_root!: ObjectsManagerNode;
	_node_context_signatures: PolyDictionary<boolean> = {};
	_instanciated_nodes_by_context_and_type: PolyDictionary<PolyDictionary<PolyDictionary<BaseNodeType>>> = {};

	init() {
		this._root = new ObjectsManagerNode(this.scene);
		this._root.initialize_base_and_node();
		// this._root.set_scene(this.scene);
		this._root.init_default_scene();
	}

	get root() {
		return this._root;
	}
	private _traverseNode(parent: BaseNodeType, callback: (node: BaseNodeType) => void) {
		const nodes = parent.children();
		if (!nodes || nodes.length == 0) {
			return;
		}

		for (let node of nodes) {
			callback(node);

			if (node.children_controller) {
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
		const children = this.root.children();
		for (let child of children) {
			this.root.children_controller?.removeNode(child);
		}
		// return children.forEach(child=> {
		// 	return this.root().removeNode(child);
		// });
	}

	node(path: string) {
		if (path === '/') {
			return this.root;
		} else {
			return this.root.node(path);
		}
	}
	allNodes() {
		let nodes: BaseNodeType[] = [this.root];
		let current_parents: BaseNodeType[] = [this.root];
		let cmptr = 0;
		while (current_parents.length > 0 && cmptr < 10) {
			const children = current_parents
				.map((current_parent) => {
					if (current_parent.children_allowed()) {
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
			const path = node.fullPath();
			if (CoreString.matchMask(path, mask)) {
				matching_nodes.push(node);
			}
		}
		return matching_nodes;
	}

	reset_node_context_signatures() {
		this._node_context_signatures = {};
	}
	register_node_context_signature(node: BaseNodeType) {
		if (node.children_allowed() && node.children_controller) {
			this._node_context_signatures[node.children_controller.node_context_signature()] = true;
		}
	}
	node_context_signatures() {
		return Object.keys(this._node_context_signatures)
			.sort()
			.map((s) => s.toLowerCase());
	}

	addToInstanciatedNode(node: BaseNodeType) {
		const context = node.node_context();
		const node_type = node.type;
		this._instanciated_nodes_by_context_and_type[context] =
			this._instanciated_nodes_by_context_and_type[context] || {};
		this._instanciated_nodes_by_context_and_type[context][node_type] =
			this._instanciated_nodes_by_context_and_type[context][node_type] || {};
		this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id] = node;
	}

	removeFromInstanciatedNode(node: BaseNodeType) {
		const context = node.node_context();
		const node_type = node.type;
		delete this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id];
	}
	nodesByType(type: string): BaseNodeType[] {
		const list: BaseNodeType[] = [];

		this._traverseNode(this.scene.root, (node) => {
			if (node.type == type) {
				list.push(node);
			}
		});

		return list;
	}

	nodesByContextAndType<T extends keyof NodeChildrenMapByContext[NodeContext.ANIM]>(
		context: NodeContext.ANIM,
		node_type: T
	): NodeChildrenMapByContext[NodeContext.ANIM][T][];
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
	nodesByContextAndType<NC extends NodeContext>(context: NC, node_type: string) {
		const nodes = [];
		const nodes_for_context = this._instanciated_nodes_by_context_and_type[context];
		if (nodes_for_context) {
			const nodes_by_ids = nodes_for_context[node_type];
			if (nodes_by_ids) {
				for (let id of Object.keys(nodes_by_ids)) {
					nodes.push(nodes_by_ids[id]);
				}
			}
		}
		return nodes;
	}
}
