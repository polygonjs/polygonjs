import {Constructor, PolyDictionary} from '../../../../types/GlobalTypes';
import {CoreString} from '../../../../core/String';
import {BaseNodeType} from '../../_Base';
import {NodeEvent} from '../../../poly/NodeEvent';
import {NodeContext} from '../../../poly/NodeContext';
import {NameController} from '../NameController';
import {CoreNodeSelection} from '../../../../core/NodeSelection';
import {Poly} from '../../../Poly';
import {ParamsInitData} from '../io/IOController';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {BaseOperationContainer} from '../../../operations/container/_Base';
import {SopOperationContainer} from '../../../operations/container/sop';
import {BaseSopOperation} from '../../../operations/sop/_Base';

type OutputNodeFindMethod = (() => BaseNodeType) | undefined;

export class HierarchyChildrenController {
	private _children: PolyDictionary<BaseNodeType> = {};
	private _children_by_type: PolyDictionary<CoreGraphNodeId[]> = {};
	private _children_and_grandchildren_by_context: PolyDictionary<CoreGraphNodeId[]> = {};

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

	set_child_name(node: BaseNodeType, new_name: string): void {
		let current_child_with_name;
		new_name = new_name.replace(/[^A-Za-z0-9]/g, '_');
		new_name = new_name.replace(/^[0-9]/, '_'); // replace first char if not a letter

		if ((current_child_with_name = this._children[new_name]) != null) {
			// only return if found node is same as argument node, and if new_name is same as current_name
			if (node.name() === new_name && current_child_with_name.graphNodeId() === node.graphNodeId()) {
				return;
			}

			// increment new_name
			new_name = CoreString.increment(new_name);

			return this.set_child_name(node, new_name);
		} else {
			const current_name = node.name();

			// delete old entry if node was in _children with old name
			const current_child = this._children[current_name];
			if (current_child) {
				delete this._children[current_name];
			}

			// add to new name
			this._children[new_name] = node;
			node.nameController.update_name_from_parent(new_name);
			this._add_to_nodesByType(node);
			this.node.scene().nodesController.addToInstanciatedNode(node);
		}
	}

	node_context_signature() {
		return `${this.node.nodeContext()}/${this.node.type()}`;
	}

	available_children_classes() {
		return Poly.registeredNodes(this._context, this.node.type());
	}

	is_valid_child_type(node_type: string): boolean {
		const node_class = this.available_children_classes()[node_type];
		return node_class != null;
	}

	// create_node(node_type: string, params_init_value_overrides?: ParamsInitData): BaseNodeType {
	// 	const node_class = this.available_children_classes()[node_type];

	// 	if (node_class == null) {
	// 		const message = `child node type '${node_type}' not found for node '${this.node.fullPath()}'. Available types are: ${Object.keys(
	// 			this.available_children_classes()
	// 		).join(', ')}, ${this._context}, ${this.node.type}`;
	// 		console.error(message);
	// 		throw message;
	// 	} else {
	// 		const child_node = new node_class(this.node.scene, `child_node_${node_type}`, params_init_value_overrides);
	// 		child_node.initialize_base_and_node();
	// 		this.add_node(child_node);
	// 		child_node.lifecycle.set_creation_completed();
	// 		return child_node;
	// 	}
	// }
	createNode<K extends BaseNodeType>(
		node_class_or_string: string | Constructor<K>,
		params_init_value_overrides?: ParamsInitData,
		node_type = ''
	): K {
		if (typeof node_class_or_string == 'string') {
			const node_class = this._find_node_class(node_class_or_string);
			return this._create_and_init_node(node_class, params_init_value_overrides, node_type) as K;
		} else {
			return this._create_and_init_node(node_class_or_string, params_init_value_overrides, node_type);
		}
	}
	private _create_and_init_node<K extends BaseNodeType>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData,
		node_type = ''
	) {
		const child_node = new node_class(this.node.scene(), `child_node_${node_type}`, params_init_value_overrides);
		child_node.initialize_base_and_node();
		this.add_node(child_node);
		child_node.lifecycle.set_creation_completed();
		return child_node;
	}
	private _find_node_class(node_type: string) {
		const node_class = this.available_children_classes()[node_type.toLowerCase()];

		if (node_class == null) {
			const message = `child node type '${node_type}' not found for node '${this.node.fullPath()}'. Available types are: ${Object.keys(
				this.available_children_classes()
			).join(', ')}, ${this._context}, ${this.node.type()}`;
			console.error(message);
			throw message;
		}
		return node_class;
	}
	create_operation_container(
		operation_type: string,
		operation_container_name: string,
		params_init_value_overrides?: ParamsInitData
	): BaseOperationContainer {
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
				params_init_value_overrides || {}
			);
			return operation_container;
		}
	}

	add_node(child_node: BaseNodeType) {
		child_node.setParent(this.node);
		child_node.params.init();
		child_node.parentController.onSetParent();
		child_node.nameController.run_post_set_fullPath_hooks();
		if (child_node.childrenAllowed() && child_node.childrenController) {
			for (let child of child_node.childrenController.children()) {
				child.nameController.run_post_set_fullPath_hooks();
			}
		}
		this.node.emit(NodeEvent.CREATED, {child_node_json: child_node.toJSON()});
		if (this.node.scene().lifecycleController.onCreateHookAllowed()) {
			child_node.lifecycle.run_on_create_hooks();
		}
		child_node.lifecycle.run_on_add_hooks();
		this.set_child_name(child_node, NameController.base_name(child_node));
		this.node.lifecycle.run_on_child_add_hooks(child_node);

		if (child_node.require_webgl2()) {
			this.node.scene().webgl_controller.set_require_webgl2();
		}

		this.node.scene().missingExpressionReferencesController.check_for_missing_references(child_node);

		return child_node;
	}

	removeNode(child_node: BaseNodeType): void {
		if (child_node.parent() != this.node) {
			return console.warn(`node ${child_node.name()} not under parent ${this.node.fullPath()}`);
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
			delete this._children[child_node.name()];
			this._remove_from_nodesByType(child_node);
			this.node.scene().nodesController.removeFromInstanciatedNode(child_node);

			// set other dependencies dirty
			// Note that this call to set_dirty was initially before this._children_node.remove_graph_input
			// but that prevented the obj/geo node to properly clear its sop_group if this was the last node
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

	_add_to_nodesByType(node: BaseNodeType) {
		const node_id = node.graphNodeId();
		const type = node.type();
		this._children_by_type[type] = this._children_by_type[type] || [];
		if (!this._children_by_type[type].includes(node_id)) {
			this._children_by_type[type].push(node_id);
		}
		this.add_to_children_and_grandchildren_by_context(node);
	}
	_remove_from_nodesByType(node: BaseNodeType) {
		const node_id = node.graphNodeId();
		const type = node.type();
		if (this._children_by_type[type]) {
			const index = this._children_by_type[type].indexOf(node_id);
			if (index >= 0) {
				this._children_by_type[type].splice(index, 1);
				if (this._children_by_type[type].length == 0) {
					delete this._children_by_type[type];
				}
			}
		}
		this.remove_from_children_and_grandchildren_by_context(node);
	}
	add_to_children_and_grandchildren_by_context(node: BaseNodeType) {
		const node_id = node.graphNodeId();
		const type = node.nodeContext();
		this._children_and_grandchildren_by_context[type] = this._children_and_grandchildren_by_context[type] || [];
		if (!this._children_and_grandchildren_by_context[type].includes(node_id)) {
			this._children_and_grandchildren_by_context[type].push(node_id);
		}
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed()) {
			parent.childrenController?.add_to_children_and_grandchildren_by_context(node);
		}
	}
	remove_from_children_and_grandchildren_by_context(node: BaseNodeType) {
		const node_id = node.graphNodeId();
		const type = node.nodeContext();
		if (this._children_and_grandchildren_by_context[type]) {
			const index = this._children_and_grandchildren_by_context[type].indexOf(node_id);
			if (index >= 0) {
				this._children_and_grandchildren_by_context[type].splice(index, 1);
				if (this._children_and_grandchildren_by_context[type].length == 0) {
					delete this._children_and_grandchildren_by_context[type];
				}
			}
		}
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed()) {
			parent.childrenController?.remove_from_children_and_grandchildren_by_context(node);
		}
	}

	nodesByType(type: string): BaseNodeType[] {
		const node_ids = this._children_by_type[type] || [];
		const graph = this.node.scene().graph;
		const nodes: BaseNodeType[] = [];
		for (let node_id of node_ids) {
			const node = graph.node_from_id(node_id) as BaseNodeType;
			if (node) {
				nodes.push(node);
			}
		}
		return nodes;
	}
	child_by_name(name: string) {
		return this._children[name];
	}

	has_children_and_grandchildren_with_context(context: NodeContext) {
		return this._children_and_grandchildren_by_context[context] != null;
	}

	children(): BaseNodeType[] {
		return Object.values(this._children);
	}
	children_names() {
		return Object.keys(this._children).sort();
	}

	traverse_children(callback: (arg0: BaseNodeType) => void) {
		for (let child of this.children()) {
			callback(child);

			child.childrenController?.traverse_children(callback);
		}
	}
}
