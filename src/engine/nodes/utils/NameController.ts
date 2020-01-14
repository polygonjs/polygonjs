import {BaseNodeType} from 'src/engine/nodes/_Base';
import lodash_isNaN from 'lodash/isNaN';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {NodeEvent} from 'src/engine/poly/NodeEvent';

type Callback = () => void;

export class NameController {
	private _graph_node: CoreGraphNode;
	private _on_set_name_hooks: Callback[];
	private _on_set_full_path_hooks: Callback[];

	constructor(protected node: BaseNodeType) {
		this._graph_node = new CoreGraphNode(node.scene, 'node_name_controller');
		// this._graph_node.set_scene(this.node.scene);
	}
	get graph_node() {
		return this._graph_node;
	}

	static base_name(node: BaseNodeType) {
		let base = node.type(); //CoreString.class_name_to_type(this.self.type())
		const last_char = base[base.length - 1];
		if (!lodash_isNaN(parseInt(last_char))) {
			base += '_';
		}
		return `${base}1`;
	}

	request_name_to_parent(new_name: string) {
		const parent = this.node.parent;
		if (parent != null) {
			parent.children_controller.set_child_name(this.node, new_name);
		} else {
			console.warn('request_name_to_parent failed, no parent found');
		}
	}
	set_name(new_name: string) {
		if (new_name != this.node.name) {
			this.request_name_to_parent(new_name);
		}
	}
	update_name_from_parent(new_name: string) {
		this.node.set_name(new_name);
		this.post_set_name();
		this.post_set_full_path();
		this.node.children_controller.children().forEach((child_node) => {
			child_node.name_controller.post_set_full_path(); // TODO: typescript: replace post_set_full_path with execute_on_update_full_path_hooks or on_update_full_path
		});
		this._graph_node.set_successors_dirty();
		this.node.emit(NodeEvent.NAME_UPDATED);
	}

	add_post_set_name_hook(hook: Callback) {
		this._on_set_name_hooks = this._on_set_name_hooks || [];
		this._on_set_name_hooks.push(hook);
	}
	add_post_set_full_path_hook(hook: Callback) {
		this._on_set_full_path_hooks = this._on_set_full_path_hooks || [];
		this._on_set_full_path_hooks.push(hook);
	}

	post_set_name() {
		if (this._on_set_name_hooks) {
			for (let hook of this._on_set_name_hooks) {
				hook();
			}
		}
	}
	post_set_full_path() {
		if (this._on_set_full_path_hooks) {
			for (let hook of this._on_set_full_path_hooks) {
				hook();
			}
		}
	}
}
