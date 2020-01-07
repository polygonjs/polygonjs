import UIData from './UIData';
import {BaseNode} from 'src/engine/nodes/_Base';
import lodash_difference from 'lodash/difference';
import lodash_union from 'lodash/union';
// import lodash_isArray from 'lodash/isArray'
import lodash_isEqual from 'lodash/isEqual';

export default class NodeSelection extends UIData {
	_node_ids: string[] = [];
	constructor(private _node: BaseNode) {
		// {
		//   // Hack: trick Babel/TypeScript into allowing this before super.
		//   if (false) { super(); }
		//   let thisFn = (() => { return this; }).toString();
		//   let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
		//   eval(`${thisName} = this;`);
		// }
		super();
		// this._node_ids = [];
	}

	node() {
		return this._node;
	}

	clear() {
		this._node_ids = [];
	}

	nodes(): BaseNode[] {
		return this._node
			.scene()
			.graph()
			.nodes_from_ids(this._node_ids);
	}

	contains(node: BaseNode): boolean {
		return this._node_ids.includes(node.graph_node_id());
	}
	equals(nodes: BaseNode[]): boolean {
		const node_ids = nodes.map((node) => node.graph_node_id()).sort();
		return lodash_isEqual(node_ids, this._node_ids);
	}

	set(nodes: BaseNode[]) {
		this.remove(this.nodes());
		return this.add(nodes);
	}

	add(nodes_to_add: BaseNode[]) {
		// if (!lodash_isArray(nodes_to_add)) { nodes_to_add = [nodes_to_add]; }

		const node_ids_to_add = nodes_to_add.map((node) => node.graph_node_id());
		this._node_ids = lodash_union(this._node_ids, node_ids_to_add);

		return this.update_nodes_ui_data(nodes_to_add);
	}

	remove(nodes_to_remove: BaseNode[]) {
		// if (!lodash_isArray(nodes_to_remove)) { nodes_to_remove = [nodes_to_remove]; }

		const node_ids_to_remove = nodes_to_remove.map((node) => node.graph_node_id());
		this._node_ids = lodash_difference(this._node_ids, node_ids_to_remove);

		this.update_nodes_ui_data(nodes_to_remove);
	}

	private update_nodes_ui_data(nodes: BaseNode[]) {
		this.node().emit('selection_update');
	}

	to_json() {
		return this._node_ids;
	}
}
