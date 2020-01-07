import {CoreString} from 'src/core/String';
import {BaseNode} from 'src/engine/nodes/_Base';
import {NodeSimple} from 'src/core/graph/NodeSimple';
// import {NameController} from '../NameController';

export class HierarchyChildrenController {
	_children_allowed: boolean = false;
	_children: Dictionary<BaseNode>;
	_children_by_type: Dictionary<string[]> = {};
	_children_and_grandchildren_by_context: Dictionary<string[]> = {};

	_is_dependent_on_children: boolean = false;
	_children_node: NodeSimple;

	constructor(protected node: BaseNode) {}

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
			node._set_name(new_name);
			this._add_to_nodes_by_type(node);
			this.self.scene().add_to_instanciated_node(node);
		}
	}
}
