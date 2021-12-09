import {Constructor} from '../../../../types/GlobalTypes';
import {CoreString} from '../../../../core/String';
import {BaseNodeClass, BaseNodeType} from '../../_Base';
import {NodeEvent} from '../../../poly/NodeEvent';
import {NodeContext} from '../../../poly/NodeContext';
import {CoreNodeSelection} from '../../../../core/NodeSelection';
import {Poly} from '../../../Poly';
import {ParamsInitData} from '../io/IOController';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {BaseOperationContainer} from '../../../operations/container/_Base';
import {SopOperationContainer} from '../../../operations/container/sop';
import {BaseSopOperation} from '../../../operations/sop/_Base';
import {MapUtils} from '../../../../core/MapUtils';
import {NameController} from '../NameController';

type OutputNodeFindMethod = (() => BaseNodeType) | undefined;

export interface NodeCreateOptions {
	paramsInitValueOverrides?: ParamsInitData;
	nodeName?: string;
}

export class HierarchyChildrenController {
	private _childrenByName: Map<string, BaseNodeType> = new Map();
	private _childrenByType: Map<string, Set<CoreGraphNodeId>> = new Map();
	private _childrenAndGrandchildrenByContext: Map<NodeContext, Set<CoreGraphNodeId>> = new Map();

	private _selection: CoreNodeSelection | undefined;
	get selection(): CoreNodeSelection {
		return (this._selection = this._selection || new CoreNodeSelection(this.node));
	}
	constructor(protected node: BaseNodeType, private _context: NodeContext) {}

	dispose() {
		const children = this.children();
		for (let child of children) {
			this.node.removeNode(child);
		}
		this._selection = undefined;
	}

	get context() {
		return this._context;
	}

	//
	//
	// OUTPUT NODE
	//
	//
	private _output_node_find_method: (() => BaseNodeType) | undefined;
	set_output_node_find_method(method: OutputNodeFindMethod) {
		this._output_node_find_method = method;
	}
	output_node() {
		if (this._output_node_find_method) {
			return this._output_node_find_method();
		}
	}

	//
	//
	//
	//
	//

	setChildName(node: BaseNodeType, newName: string): void {
		let currentChildWithName: BaseNodeType | undefined;
		newName = CoreString.sanitizeName(newName);

		if ((currentChildWithName = this._childrenByName.get(newName)) != null) {
			// only return if found node is same as argument node, and if new_name is same as current_name
			if (node.name() === newName && currentChildWithName.graphNodeId() === node.graphNodeId()) {
				return;
			}

			// increment new_name
			newName = CoreString.increment(newName);

			return this.setChildName(node, newName);
		} else {
			const currentName = node.name();

			// delete old entry if node was in _children with old name
			const currentChild = this._childrenByName.get(currentName);
			if (currentChild) {
				this._childrenByName.delete(currentName);
			}

			// add to new name
			this._childrenByName.set(newName, node);
			node.nameController.updateNameFromParent(newName);
			this._addToNodesByType(node);
			this.node.scene().nodesController.addToInstanciatedNode(node);
		}
	}
	private _nextAvailableChildName(nodeName: string): string {
		nodeName = CoreString.sanitizeName(nodeName);
		return this._childrenByName.get(nodeName)
			? this._nextAvailableChildName(CoreString.increment(nodeName))
			: nodeName;
	}

	node_context_signature() {
		return `${this.node.context()}/${this.node.type()}`;
	}

	availableChildrenClasses() {
		return Poly.registeredNodes(this._context, this.node.type());
	}

	isValidChildType(node_type: string): boolean {
		const node_class = this.availableChildrenClasses()[node_type];
		return node_class != null;
	}

	// create_node(node_type: string, options?: NodeCreateOptions): BaseNodeType {
	// 	const node_class = this.available_children_classes()[node_type];

	// 	if (node_class == null) {
	// 		const message = `child node type '${node_type}' not found for node '${this.node.path()}'. Available types are: ${Object.keys(
	// 			this.available_children_classes()
	// 		).join(', ')}, ${this._context}, ${this.node.type}`;
	// 		console.error(message);
	// 		throw message;
	// 	} else {
	// 		const child_node = new node_class(this.node.scene, `child_node_${node_type}`, paramsInitValueOverrides);
	// 		child_node.initialize_base_and_node();
	// 		this.add_node(child_node);
	// 		child_node.lifecycle.set_creation_completed();
	// 		return child_node;
	// 	}
	// }
	createNode<K extends BaseNodeType>(nodeClassOrString: string | Constructor<K>, options?: NodeCreateOptions): K {
		if (typeof nodeClassOrString == 'string') {
			const nodeClass = this._findNodeClass(nodeClassOrString);
			return this._createAndInitNode(nodeClass, options) as K;
		} else {
			return this._createAndInitNode(nodeClassOrString, options);
		}
	}
	private _createAndInitNode<K extends BaseNodeType>(nodeClass: Constructor<K>, options?: NodeCreateOptions) {
		const requestedNodeName =
			options?.nodeName || NameController.baseName((<unknown>nodeClass) as typeof BaseNodeClass);
		const nodeName = this._nextAvailableChildName(requestedNodeName);
		const childNode = new nodeClass(this.node.scene(), nodeName, options);
		childNode.initializeBaseAndNode();
		this._addNode(childNode);
		childNode.lifecycle.setCreationCompleted();
		return childNode;
	}
	private _findNodeClass(node_type: string) {
		const nodeClass = this.availableChildrenClasses()[node_type.toLowerCase()];

		if (nodeClass == null) {
			const message = `child node type '${node_type}' not found for node '${this.node.path()}'. Available types are: ${Object.keys(
				this.availableChildrenClasses()
			).join(', ')}, ${this._context}, ${this.node.type()}`;
			console.error(message);
			throw message;
		}
		return nodeClass;
	}
	createOperationContainer(
		operation_type: string,
		operation_container_name: string,
		options?: NodeCreateOptions
	): BaseOperationContainer<any> {
		const operation_class = Poly.registeredOperation(this._context, operation_type);

		if (operation_class == null) {
			const message = `no operation found with context ${this._context}/${operation_type}`;
			console.error(message);
			throw message;
		} else {
			const operation = new operation_class(this.node.scene()) as BaseSopOperation;
			const operation_container = new SopOperationContainer(
				operation,
				operation_container_name,
				options?.paramsInitValueOverrides || {}
			);
			return operation_container;
		}
	}

	private _addNode(child_node: BaseNodeType) {
		child_node.setParent(this.node);
		child_node.params.init();
		child_node.parentController.onSetParent();
		child_node.nameController.runPostSetFullPathHooks();
		if (child_node.childrenAllowed() && child_node.childrenController) {
			for (let child of child_node.childrenController.children()) {
				child.nameController.runPostSetFullPathHooks();
			}
		}
		this.node.emit(NodeEvent.CREATED, {child_node_json: child_node.toJSON()});
		if (this.node.scene().lifecycleController.onCreateHookAllowed()) {
			child_node.lifecycle.run_on_create_hooks();
		}
		child_node.lifecycle.run_on_add_hooks();
		this.node.lifecycle.run_on_child_add_hooks(child_node);

		if (child_node.require_webgl2()) {
			this.node.scene().webgl_controller.set_require_webgl2();
		}

		this.node.scene().missingExpressionReferencesController.checkForMissingReferences(child_node);

		return child_node;
	}

	removeNode(child_node: BaseNodeType): void {
		if (child_node.parent() != this.node) {
			return console.warn(`node ${child_node.name()} not under parent ${this.node.path()}`);
		} else {
			if (this.selection.contains(child_node)) {
				this.selection.remove([child_node]);
			}

			const first_connection = child_node.io.connections.firstInputConnection();
			const input_connections = child_node.io.connections.inputConnections();
			const output_connections = child_node.io.connections.outputConnections();
			if (input_connections) {
				for (let input_connection of input_connections) {
					if (input_connection) {
						input_connection.disconnect({setInput: true});
					}
				}
			}
			if (output_connections) {
				for (let output_connection of output_connections) {
					if (output_connection) {
						output_connection.disconnect({setInput: true});
						if (first_connection) {
							const old_src = first_connection.node_src;
							const old_output_index = output_connection.output_index;
							const old_dest = output_connection.node_dest;
							const old_input_index = output_connection.input_index;
							old_dest.io.inputs.setInput(old_input_index, old_src, old_output_index);
						}
					}
				}
			}

			// remove from children
			child_node.setParent(null);
			this._childrenByName.delete(child_node.name());
			this._removeFromNodesByType(child_node);
			this.node.scene().nodesController.removeFromInstanciatedNode(child_node);

			// set other dependencies dirty
			// Note that this call to set_dirty was initially before this._children_node.remove_graph_input
			// but that prevented the obj/geo node to properly clear its sopGroup if this was the last node
			// if (this._is_dependent_on_children && this._children_node) {
			// 	this._children_node.set_successors_dirty(this.node);
			// }
			child_node.setSuccessorsDirty(this.node);
			// disconnect successors
			child_node.graphDisconnectSuccessors();

			this.node.lifecycle.run_on_child_remove_hooks(child_node);
			child_node.lifecycle.run_on_delete_hooks();
			child_node.dispose();
			child_node.emit(NodeEvent.DELETED, {parent_id: this.node.graphNodeId()});
		}
	}

	private _addToNodesByType(node: BaseNodeType) {
		const nodeId = node.graphNodeId();
		const type = node.type();
		MapUtils.addToSetAtEntry(this._childrenByType, type, nodeId);
		this._addToChildrenAndGrandchildrenByContext(node);
	}
	private _removeFromNodesByType(node: BaseNodeType) {
		const nodeId = node.graphNodeId();
		const type = node.type();

		MapUtils.removeFromSetAtEntry(this._childrenByType, type, nodeId);
		this._removeFromChildrenAndGrandchildrenByContext(node);
	}
	private _addToChildrenAndGrandchildrenByContext(node: BaseNodeType) {
		const nodeId = node.graphNodeId();
		const nodeContext = node.context();

		MapUtils.addToSetAtEntry(this._childrenAndGrandchildrenByContext, nodeContext, nodeId);
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed()) {
			parent.childrenController?._addToChildrenAndGrandchildrenByContext(node);
		}
	}
	private _removeFromChildrenAndGrandchildrenByContext(node: BaseNodeType) {
		const nodeId = node.graphNodeId();
		const type = node.context();
		MapUtils.removeFromSetAtEntry(this._childrenAndGrandchildrenByContext, type, nodeId);
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed()) {
			parent.childrenController?._removeFromChildrenAndGrandchildrenByContext(node);
		}
	}

	nodesByType(type: string): BaseNodeType[] {
		const nodeIds = this._childrenByType.get(type);
		if (!nodeIds) {
			return [];
		}
		const graph = this.node.scene().graph;
		const nodes: BaseNodeType[] = [];
		for (let node_id of nodeIds) {
			const node = graph.nodeFromId(node_id) as BaseNodeType;
			if (node) {
				nodes.push(node);
			}
		}
		return nodes;
	}
	childByName(name: string) {
		return this._childrenByName.get(name) || null;
	}

	hasChildrenAndGrandchildrenWithContext(context: NodeContext) {
		return this._childrenAndGrandchildrenByContext.get(context) != null;
	}

	children(): BaseNodeType[] {
		const nodes: BaseNodeType[] = [];
		this._childrenByName.forEach((node) => {
			nodes.push(node);
		});
		return nodes;
	}
	childrenNames() {
		const names: string[] = [];
		this._childrenByName.forEach((node, nodeName) => {
			names.push(nodeName);
		});
		return names;
	}

	traverseChildren(callback: (arg0: BaseNodeType) => void) {
		this._childrenByName.forEach((childNode) => {
			callback(childNode);
			childNode.childrenController?.traverseChildren(callback);
		});
	}
}
