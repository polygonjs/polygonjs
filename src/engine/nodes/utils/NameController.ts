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
		// this._graph_node.setScene(this.node.scene);
	}

	dispose() {
		this._graph_node.dispose();
		this._on_set_name_hooks = undefined;
		this._on_set_fullPath_hooks = undefined;
	}

	get graph_node() {
		return this._graph_node;
	}

	static base_name(node: BaseNodeType) {
		let base: string = node.type();
		const last_char = base[base.length - 1];
		if (!CoreType.isNaN(parseInt(last_char))) {
			base += '_';
		}
		return `${base}1`;
	}

	requestNameToParent(new_name: string) {
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed() && parent.childrenController) {
			parent.childrenController.setChildName(this.node, new_name);
		} else {
			console.warn('requestNameToParent failed, no parent found');
		}
	}
	setName(new_name: string) {
		if (new_name != this.node.name()) {
			this.requestNameToParent(new_name);
		}
	}
	updateNameFromParent(new_name: string) {
		this.node._set_core_name(new_name);
		this._postSetName();
		this.runPostSetFullPathHooks();
		if (this.node.childrenAllowed()) {
			const children = this.node.childrenController?.children();
			if (children) {
				for (let child_node of children) {
					child_node.nameController.runPostSetFullPathHooks();
				}
			}
		}

		if (this.node.lifecycle.creationCompleted()) {
			this.node.scene().missingExpressionReferencesController.checkForMissingReferences(this.node);
			this.node.scene().expressionsController.regenerateReferringExpressions(this.node);
		}
		this.node.scene().referencesController.notifyNameUpdated(this.node);
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

	private _postSetName() {
		if (this._on_set_name_hooks) {
			for (let hook of this._on_set_name_hooks) {
				hook();
			}
		}
	}
	runPostSetFullPathHooks() {
		if (this._on_set_fullPath_hooks) {
			for (let hook of this._on_set_fullPath_hooks) {
				hook();
			}
		}
	}
}
