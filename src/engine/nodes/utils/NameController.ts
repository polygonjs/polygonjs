import {BaseNode} from 'src/engine/nodes/_Base';
import lodash_isNaN from 'lodash/isNaN';

type Callback = () => void;

export class NameController {
	_on_set_name_hooks: Callback[];
	_on_set_full_path_hooks: Callback[];
	constructor(protected node: BaseNode) {}

	static base_name(node: BaseNode) {
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
		if (new_name != this.node.name()) {
			this.request_name_to_parent(new_name);
		}
	}
	update_name_from_parent(new_name: string) {
		this.node.set_name(new_name);
		this.post_set_name();
		this.post_set_full_path();
		this.node.children_controller.children().forEach((node) => node.name_controller.post_set_full_path());
		this.node.name_graph_node().set_dirty();
		this.node.name_graph_node().remove_dirty_state();
		this.node.emit('node_name_update');
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
