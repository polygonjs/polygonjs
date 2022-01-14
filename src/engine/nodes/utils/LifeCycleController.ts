import {BaseNodeType} from '../_Base';

type Callback = () => void;
type CallbackWithChildNode = (child_node: BaseNodeType) => void;

export class LifeCycleController {
	protected _creation_completed = false;
	protected _on_child_add_hooks: CallbackWithChildNode[] | undefined;
	private _on_child_remove_hooks: CallbackWithChildNode[] | undefined;
	// _on_creation_completed_hooks are used in the importer, once the node has been created, added and params are set
	// private _on_creation_completed_hooks: Callback[] | undefined;
	private _on_create_hooks: Callback[] | undefined;
	private _on_add_hooks: Callback[] | undefined;
	private _on_delete_hooks: Callback[] | undefined;
	constructor(protected node: BaseNodeType) {}

	dispose() {
		this._on_child_add_hooks = undefined;
		this._on_child_remove_hooks = undefined;
		this._on_create_hooks = undefined;
		this._on_add_hooks = undefined;
		this._on_delete_hooks = undefined;
	}

	setCreationCompleted() {
		if (!this._creation_completed) {
			this._creation_completed = true;
			// this.run_on_creation_completed_hooks();
		}
	}
	creationCompleted() {
		return this.node.scene().loadingController.loaded() && this._creation_completed;
	}
	//
	//
	// ON CREATION COMPLETED
	//
	//
	// add_on_creation_completed_hook(callback: Callback) {
	// 	this._on_creation_completed_hooks = this._on_creation_completed_hooks || [];
	// 	this._on_creation_completed_hooks.push(callback);
	// }
	// private run_on_creation_completed_hooks() {
	// 	if (this._on_creation_completed_hooks) {
	// 		console.log('run_on_creation_completed_hooks', this.node.name);
	// 	}
	// 	this.execute_hooks(this._on_creation_completed_hooks);
	// }
	//
	//
	// ON CHILD ADD
	//
	//
	onChildAdd(callback: CallbackWithChildNode) {
		this._on_child_add_hooks = this._on_child_add_hooks || [];
		this._on_child_add_hooks.push(callback);
	}
	runOnChildAddCallbacks(node: BaseNodeType) {
		this._executeCallbacksWithChildNode(this._on_child_add_hooks, node);
	}

	//
	//
	// ON CHILD REMOVE
	//
	//
	onChildRemove(callback: CallbackWithChildNode) {
		this._on_child_remove_hooks = this._on_child_remove_hooks || [];
		this._on_child_remove_hooks.push(callback);
	}
	runOnChildRemoveCallbacks(node: BaseNodeType) {
		this._executeCallbacksWithChildNode(this._on_child_remove_hooks, node);
	}

	//
	//
	// ON CREATE
	//
	//
	onCreate(callback: Callback) {
		this._on_create_hooks = this._on_create_hooks || [];
		this._on_create_hooks.push(callback);
	}
	runOnCreateCallbacks() {
		this._executeCallbacks(this._on_create_hooks);
	}

	//
	//
	// ON ADD
	//
	//
	onAdd(callback: Callback) {
		this._on_add_hooks = this._on_add_hooks || [];
		this._on_add_hooks.push(callback);
	}
	runOnAddCallbacks() {
		this._executeCallbacks(this._on_add_hooks);
	}

	//
	//
	// ON DELETE
	//
	//
	// TODO: that is not very different than methods in .dispose
	// so this should probably be removed/refactored
	onDelete(callback: Callback) {
		this._on_delete_hooks = this._on_delete_hooks || [];
		this._on_delete_hooks.push(callback);
	}
	runOnDeleteCallbacks() {
		this._executeCallbacks(this._on_delete_hooks);
	}

	//
	//
	// UTILS
	//
	//
	protected _executeCallbacks(hooks: Callback[] | undefined) {
		if (hooks) {
			let hook: Callback | undefined;
			// do not flush, as this MAY BE needed multiple times
			for (hook of hooks) {
				hook();
			}
		}
	}
	protected _executeCallbacksWithChildNode(hooks: CallbackWithChildNode[] | undefined, child_node: BaseNodeType) {
		if (hooks) {
			let hook: CallbackWithChildNode | undefined;
			// do not flush, as this is needed multiple times
			for (hook of hooks) {
				hook(child_node);
			}
		}
	}
}
