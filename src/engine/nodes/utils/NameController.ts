import {BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {NodeEvent} from '../../poly/NodeEvent';
import {CoreType} from '../../../core/Type';

type Callback = () => void;

export class NameController {
	private _graph_node: CoreGraphNode;
	private _on_set_name_hooks: Callback[] | undefined;
	private _on_set_fullPath_hooks: Callback[] | undefined;

	constructor(protected node: BaseNodeType) {
		this._graph_node = new CoreGraphNode(node.scene(), 'node_name_controller');
		// this._graph_node.set_scene(this.node.scene);
	}
	get graph_node() {
		return this._graph_node;
	}

	static base_name(node: BaseNodeType) {
		let base: string = node.type;
		const last_char = base[base.length - 1];
		if (!CoreType.isNaN(parseInt(last_char))) {
			base += '_';
		}
		return `${base}1`;
	}

	request_name_to_parent(new_name: string) {
		const parent = this.node.parent;
		if (parent && parent.children_allowed() && parent.children_controller) {
			parent.children_controller.set_child_name(this.node, new_name);
		} else {
			console.warn('request_name_to_parent failed, no parent found');
		}
	}
	setName(new_name: string) {
		if (new_name != this.node.name) {
			this.request_name_to_parent(new_name);
		}
	}
	update_name_from_parent(new_name: string) {
		this.node._set_core_name(new_name);
		this.post_setName();
		this.run_post_set_fullPath_hooks();
		if (this.node.children_allowed()) {
			const children = this.node.children_controller?.children();
			if (children) {
				for (let child_node of children) {
					child_node.name_controller.run_post_set_fullPath_hooks();
				}
			}
		}

		if (this.node.lifecycle.creation_completed) {
			this.node.scene().missingExpressionReferencesController.check_for_missing_references(this.node);
			this.node.scene().expressionsController.regenerate_referring_expressions(this.node);
		}
		this.node.scene().referencesController.notify_name_updated(this.node);
		this.node.emit(NodeEvent.NAME_UPDATED);
	}

	add_post_set_name_hook(hook: Callback) {
		this._on_set_name_hooks = this._on_set_name_hooks || [];
		this._on_set_name_hooks.push(hook);
	}
	add_post_set_fullPath_hook(hook: Callback) {
		this._on_set_fullPath_hooks = this._on_set_fullPath_hooks || [];
		this._on_set_fullPath_hooks.push(hook);
	}

	post_setName() {
		if (this._on_set_name_hooks) {
			for (let hook of this._on_set_name_hooks) {
				hook();
			}
		}
	}
	run_post_set_fullPath_hooks() {
		if (this._on_set_fullPath_hooks) {
			for (let hook of this._on_set_fullPath_hooks) {
				hook();
			}
		}
	}
}
