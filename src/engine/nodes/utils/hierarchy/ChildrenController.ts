import {CoreString} from 'src/core/String';
import {CoreWalker} from 'src/core/Walker';
import {BaseNode} from 'src/engine/nodes/_Base';
import {NodeSimple} from 'src/core/graph/NodeSimple';

import lodash_includes from 'lodash/includes';
import lodash_keys from 'lodash/keys';
import lodash_sortBy from 'lodash/sortBy';
import lodash_values from 'lodash/values';
// import {NameController} from '../NameController';

// interface HierarchyOptions {
// 	context: NodeContext
// 	dependent?: boolean;
// }
const NODE_SIMPLE_NAME = 'children';

export class HierarchyChildrenController {
	private _context: NodeContext;
	private _children_allowed: boolean = false;
	private _children: Dictionary<BaseNode>;
	private _children_by_type: Dictionary<string[]> = {};
	private _children_and_grandchildren_by_context: Dictionary<string[]> = {};

	private _is_dependent_on_children: boolean = false;
	private _children_node: NodeSimple;

	constructor(protected node: BaseNode) {}

	init(context: NodeContext, dependent: boolean = false) {
		// const context = this.node.children_context();
		// if (context) {
		// this._available_children_classes = options['children'] || {};
		// this._available_children_classes = window.POLY.registered_nodes(context, this.self.type())

		this._context = context;
		this._children_allowed = true;
		this._children = {};

		// const is_dependent = options['dependent'];
		if (dependent) {
			this._is_dependent_on_children = dependent;
			if (this._is_dependent_on_children) {
				this._children_node = new NodeSimple(NODE_SIMPLE_NAME);
				this._children_node.set_scene(this.node.scene());
				this.node.add_graph_input(this._children_node);
			}
		}
		// }
	}
	get context() {
		return this._context;
	}

	// TODO: when copy pasting a node called bla_11, the next one will be renamed bla_110 instead of 12
	set_child_name(node: BaseNode, new_name: string): void {
		//return if node.name() == new_name
		let current_child_with_name;
		new_name = new_name.replace(/[^A-Za-z0-9]/g, '_');
		new_name = new_name.replace(/^[0-9]/, '_'); // replace first char if not a letter

		if ((current_child_with_name = this._children[new_name]) != null) {
			// only return if found node is same as argument node, and if new_name is same as current_name
			if (node.name() === new_name && current_child_with_name.graph_node_id() === node.graph_node_id()) {
				return;
			}

			// increment new_name
			new_name = CoreString.increment(new_name);

			return this.set_child_name(node, new_name);
		} else {
			// let current_child;
			const current_name = node.name();

			// delete old entry if node was in _children with old name
			const current_child = this._children[current_name];
			if (current_child) {
				delete this._children[current_name];
			}

			// add to new name
			this._children[new_name] = node;
			node.name_controller.update_name_from_parent(new_name);
			this._add_to_nodes_by_type(node);
			this.node.scene().nodes_controller.add_to_instanciated_node(node);
		}
	}

	node_context_signature() {
		return `${this.node.node_context()}/${this.node.type()}`;
	}

	available_children_classes() {
		return POLY.registered_nodes(this._context, this.node.type());
	}
	children_allowed(): boolean {
		// return (this.self.available_children_classes != null) &&
		// (Object.keys(this.self.available_children_classes()).length > 0);
		const available_classes = this.available_children_classes();
		return available_classes && Object.keys(available_classes).length > 0;
	}

	create_node(node_type: string): BaseNode {
		if (this.available_children_classes() == null) {
			throw `no children available for ${this.node.full_path()}.`;
		} else {
			const node_class = this.available_children_classes()[node_type];

			if (node_class == null) {
				const message = `node type ${node_type} not found for ${this.node.full_path()} (${Object.keys(
					this.available_children_classes()
				).join(', ')}, ${this._context}, ${this.node.type()})`;
				console.error(message);
				throw message;
			} else {
				const child_node = new node_class();
				child_node.set_scene(this.node.scene());
				this.add_node(child_node);
				return child_node;
			}
		}
	}

	private add_node(child_node: BaseNode) {
		if (!this._children_allowed) {
			throw `node ${this.node.full_path()} cannot have children`;
		}

		child_node.set_parent(this.node);
		child_node.params.init();
		child_node.parent_controller.on_set_parent();
		child_node.name_controller.post_set_full_path();
		for (let child of child_node.children_controller.children()) {
			child.name_controller.post_set_full_path();
		}
		this.node.emit('node_created', {child_node: child_node});
		this.node.lifecycle.on_child_add(child_node);
		if (this.node.scene().lifecycle_controller.on_create_hook_allowed()) {
			child_node.lifecycle.on_create();
		}
		// this.post_add_node(child_node);

		if (this._is_dependent_on_children) {
			this._children_node.add_graph_input(child_node);
		}
		if (child_node.require_webgl2()) {
			this.node.scene().webgl_controller.set_require_webgl2();
		}

		return child_node;
	}
	// that's redondant with the lifecycle on_child_add and on_child_remove
	// post_add_node(node: BaseNode) {}
	// post_remove_node(node: BaseNode) {}

	remove_node(child_node: BaseNode) {
		if (child_node.parent != this.node) {
			return console.warn(`node ${child_node.name()} not under parent ${this.node.full_path()}`);
		} else {
			// set other dependencies dirty
			child_node.set_dirty(this.node);

			if (this._is_dependent_on_children) {
				this._children_node.remove_graph_input(child_node);
			}

			if (this.node.selection.contains(child_node)) {
				this.node.selection.remove([child_node]);
			}

			const first_connection = child_node.io.connections.first_input_connection();
			child_node.io.connections.input_connections().forEach((input_connection) => {
				if (input_connection) {
					input_connection.disconnect({set_input: true});
				}
			});
			child_node.io.connections.output_connections().forEach((output_connection) => {
				if (output_connection) {
					output_connection.disconnect({set_input: true});
					if (first_connection) {
						const old_src = first_connection.node_src;
						const old_output_index = output_connection.output_index;
						const old_dest = output_connection.node_dest;
						const old_input_index = output_connection.input_index;
						old_dest.io.inputs.set_input(old_input_index, old_src, old_output_index);
					}
				}
			});

			// disconnect successors
			child_node.graph_disconnect_successors();

			// remove from children
			child_node.set_parent(null);
			delete this._children[child_node.name()];
			this._remove_from_nodes_by_type(child_node);
			this.node.scene().nodes_controller.remove_from_instanciated_node(child_node);

			this.node.lifecycle.on_child_remove(child_node);
			child_node.lifecycle.on_delete();
			// this.post_remove_node(node);
			child_node.emit('node_deleted', {parent: this.node});
			return child_node;
		}
	}

	find_node(path: string): BaseNode | null {
		if (this._children_allowed != true) {
			return null;
		}
		if (path == null) {
			return null;
		}
		if (path === CoreWalker.CURRENT || path === CoreWalker.CURRENT_WITH_SLASH) {
			return this.node;
		}
		if (path === CoreWalker.PARENT || path === CoreWalker.PARENT_WITH_SLASH) {
			return this.node.parent;
		}

		const separator = CoreWalker.separator();
		if (path[0] === separator) {
			path = path.substring(1, path.length);
		}

		const elements = path.split(separator);
		if (elements.length === 1) {
			const name = elements[0];
			return this._children[name];
		} else {
			return CoreWalker.find_node(this.node, path);
		}
	}

	_add_to_nodes_by_type(node: BaseNode) {
		const node_id = node.graph_node_id();
		const type = node.type();
		this._children_by_type[type] = this._children_by_type[type] || [];
		if (!lodash_includes(this._children_by_type[type], node_id)) {
			this._children_by_type[type].push(node_id);
		}
		this.add_to_children_and_grandchildren_by_context(node);
	}
	_remove_from_nodes_by_type(node: BaseNode) {
		const node_id = node.graph_node_id();
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
	add_to_children_and_grandchildren_by_context(node: BaseNode) {
		const node_id = node.graph_node_id();
		const type = node.node_context();
		this._children_and_grandchildren_by_context[type] = this._children_and_grandchildren_by_context[type] || [];
		if (!lodash_includes(this._children_and_grandchildren_by_context[type], node_id)) {
			this._children_and_grandchildren_by_context[type].push(node_id);
		}
		if (this.node.parent) {
			this.node.parent.children_controller.add_to_children_and_grandchildren_by_context(node);
		}
	}
	remove_from_children_and_grandchildren_by_context(node: BaseNode) {
		const node_id = node.graph_node_id();
		const type = node.node_context();
		if (this._children_and_grandchildren_by_context[type]) {
			const index = this._children_and_grandchildren_by_context[type].indexOf(node_id);
			if (index >= 0) {
				this._children_and_grandchildren_by_context[type].splice(index, 1);
				if (this._children_and_grandchildren_by_context[type].length == 0) {
					delete this._children_and_grandchildren_by_context[type];
				}
			}
		}
		if (this.node.parent) {
			this.node.parent.children_controller.remove_from_children_and_grandchildren_by_context(node);
		}
	}

	nodes_by_type(type: string): BaseNode[] {
		const node_ids = this._children_by_type[type] || [];
		const graph = this.node.scene().graph;
		return node_ids.map((node_id) => graph.node_from_id(node_id));
	}
	// children_and_grandchildren_by_context(context: NodeContext): BaseNode[]{
	// 	const node_ids = this._children_and_grandchildren_by_context[context] || []
	// 	const graph = this.self.scene().graph()
	// 	return node_ids.map(node_id=>graph.node_from_id(node_id))
	// }
	has_children_and_grandchildren_with_context(context: NodeContext) {
		return this._children_and_grandchildren_by_context[context] != null;
	}
	//lodash_filter this.children(), (child)=>
	//	child.type() == type

	children(): BaseNode[] {
		return lodash_values(this._children);
	}
	children_names() {
		return lodash_sortBy(lodash_keys(this._children));
	}
	// children_map: ->
	// 	@_children

	traverse_children(callback: (arg0: BaseNode) => void) {
		for (let child of this.children()) {
			callback(child);

			// if (child.traverse_children != null) { // TODO: typescript
			child.children_controller?.traverse_children(callback);
			// }
		}
	}
}
