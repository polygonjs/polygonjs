import {BaseNodeClass, BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {NodeEvent} from '../../poly/NodeEvent';
import {CoreType} from '../../../core/Type';

type NameControllerCallback = () => void;

export class NameController {
	private _graphNode: CoreGraphNode;
	private _onSetNameHooks: NameControllerCallback[] | undefined;
	private _onSetFullPathHooks: NameControllerCallback[] | undefined;

	constructor(protected node: BaseNodeType) {
		this._graphNode = new CoreGraphNode(node.scene(), 'nodeNameController');
		// this._graph_node.setScene(this.node.scene);
	}

	dispose() {
		this._graphNode.dispose();
		this._onSetNameHooks = undefined;
		this._onSetFullPathHooks = undefined;
	}

	graphNode() {
		return this._graphNode;
	}

	static baseName(node: BaseNodeType | typeof BaseNodeClass) {
		let base: string = node.type();
		const last_char = base[base.length - 1];
		if (!CoreType.isNaN(parseInt(last_char))) {
			base += '_';
		}
		return `${base}1`;
	}

	requestNameToParent(newName: string) {
		const parent = this.node.parent();
		if (parent && parent.childrenAllowed() && parent.childrenController) {
			parent.childrenController.setChildName(this.node, newName);
		} else {
			console.warn('requestNameToParent failed, no parent found');
		}
	}
	setName(newName: string) {
		if (newName != this.node.name()) {
			if (this.node.insideALockedParent()) {
				const lockedParent = this.node.lockedParent();
				console.warn(
					`node '${this.node.path()}' cannot have its name changed, since it is inside '${
						lockedParent ? lockedParent.path() : ''
					}', which is locked`
				);
				return;
			}

			this.requestNameToParent(newName);
		}
	}
	updateNameFromParent(new_name: string) {
		this.node._setCoreName(new_name);
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

		if (this.node.lifecycle.creationCompleted() && this.node.scene().loadingController.loaded()) {
			this.node.scene().missingExpressionReferencesController.checkForMissingNodeReferences(this.node);
			this.node.scene().expressionsController.regenerateReferringExpressions(this.node);
		}
		this.node.scene().referencesController.notifyNameUpdated(this.node);
		this.node.emit(NodeEvent.NAME_UPDATED);
	}

	add_post_set_name_hook(hook: NameControllerCallback) {
		this._onSetNameHooks = this._onSetNameHooks || [];
		this._onSetNameHooks.push(hook);
	}
	add_post_set_fullPath_hook(hook: NameControllerCallback) {
		this._onSetFullPathHooks = this._onSetFullPathHooks || [];
		this._onSetFullPathHooks.push(hook);
	}

	private _postSetName() {
		if (this._onSetNameHooks) {
			for (let hook of this._onSetNameHooks) {
				hook();
			}
		}
	}
	runPostSetFullPathHooks() {
		if (this._onSetFullPathHooks) {
			for (let hook of this._onSetFullPathHooks) {
				hook();
			}
		}
	}
}
