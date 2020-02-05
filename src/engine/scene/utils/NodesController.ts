import {PolyScene} from 'src/engine/scene/PolyScene';

import {Object3D} from 'three/src/core/Object3D';
import lodash_concat from 'lodash/concat';
import lodash_flatten from 'lodash/flatten';
import lodash_compact from 'lodash/compact';
import {ObjectsManagerNode} from 'src/engine/nodes/manager/ObjectsManager';
import {CoreString} from 'src/core/String';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseObjNodeType} from 'src/engine/nodes/obj/_Base';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class NodesController {
	constructor(private scene: PolyScene) {}

	_root!: ObjectsManagerNode;
	_node_context_signatures: Dictionary<boolean> = {};
	_instanciated_nodes_by_context_and_type: Dictionary<Dictionary<Dictionary<BaseNodeType>>> = {};

	init() {
		this._root = new ObjectsManagerNode(this.scene);
		this._root.initialize_base_and_node();
		// this._root.set_scene(this.scene);
		this._root.init_display_scene();
	}

	get root() {
		return this._root;
	}
	objects_from_mask(mask: string): Object3D[] {
		const masks = mask.split(' ');
		// let geos = this.root().nodes_by_type('geo') as BaseNodeObj[];
		let nodes = this.root.children() as BaseObjNodeType[];
		nodes = nodes.filter((node) => CoreString.matches_one_mask(node.name, masks));
		const objects = nodes.map((geo) => geo.object);
		return lodash_compact(objects);
	}
	clear() {
		const children = this.root.children();
		for (let child of children) {
			this.root.children_controller.remove_node(child);
		}
		// return children.forEach(child=> {
		// 	return this.root().remove_node(child);
		// });
	}

	node(path: string) {
		if (path === '/') {
			return this.root;
		} else {
			return this.root.node(path);
		}
	}
	all_nodes() {
		let nodes: BaseNodeType[] = [this.root];
		let current_parents: BaseNodeType[] = [this.root];
		let cmptr = 0;
		while (current_parents.length > 0 && cmptr < 10) {
			const children = lodash_flatten(
				current_parents.map((current_parent) => {
					if (current_parent.children_controller.children_allowed()) {
						return current_parent.children();
					} else {
						return [];
					}
				})
			);
			nodes = lodash_concat(nodes, children);
			current_parents = children;
			cmptr += 1;
		}
		return lodash_flatten(nodes);
	}

	reset_node_context_signatures() {
		this._node_context_signatures = {};
	}
	register_node_context_signature(node: BaseNodeType) {
		this._node_context_signatures[node.children_controller.node_context_signature()] = true;
	}
	node_context_signatures() {
		return Object.keys(this._node_context_signatures)
			.sort()
			.map((s) => s.toLowerCase());
	}

	add_to_instanciated_node(node: BaseNodeType) {
		const context = node.node_context();
		const node_type = node.type;
		this._instanciated_nodes_by_context_and_type[context] =
			this._instanciated_nodes_by_context_and_type[context] || {};
		this._instanciated_nodes_by_context_and_type[context][node_type] =
			this._instanciated_nodes_by_context_and_type[context][node_type] || {};
		this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id] = node;
	}

	remove_from_instanciated_node(node: BaseNodeType) {
		const context = node.node_context();
		const node_type = node.type;
		delete this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id];
	}

	instanciated_nodes(context: NodeContext, node_type: string) {
		const nodes = [];
		if (this._instanciated_nodes_by_context_and_type[context]) {
			const nodes_by_ids = this._instanciated_nodes_by_context_and_type[context][node_type];
			if (nodes_by_ids) {
				for (let id of Object.keys(nodes_by_ids)) {
					nodes.push(nodes_by_ids[id]);
				}
			}
		}
		return nodes;
	}
}
