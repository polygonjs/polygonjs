import {BaseNodeType} from '../_Base';

type Callback = () => void;
type CallbackWithChildNode = (childNode: BaseNodeType) => void;

export class LifeCycleController {
	protected _creationCompleted = false;
	protected _onChildAddCallbacks: CallbackWithChildNode[] | undefined;
	private _onChildRemoveCallbacks: CallbackWithChildNode[] | undefined;
	// _on_creation_completed_hooks are used in the importer, once the node has been created, added and params are set
	// private _on_creation_completed_hooks: Callback[] | undefined;
	private _onAfterCreatedCallbacks: Callback[] | undefined;
	private _onAfterAddedCallbacks: Callback[] | undefined;
	private _onBeforeDeletedCallbacks: Callback[] | undefined;
	private _onAfterDeletedCallbacks: Callback[] | undefined;
	constructor(protected node: BaseNodeType) {}

	dispose() {
		this._onChildAddCallbacks = undefined;
		this._onChildRemoveCallbacks = undefined;
		this._onAfterCreatedCallbacks = undefined;
		this._onAfterAddedCallbacks = undefined;
		this._onBeforeDeletedCallbacks = undefined;
		this._onAfterDeletedCallbacks = undefined;
	}

	setCreationCompleted() {
		if (!this._creationCompleted) {
			this._creationCompleted = true;
			// this.run_on_creation_completed_hooks();
		}
	}
	creationCompleted() {
		return this.node.scene().loadingController.loaded() && this._creationCompleted;
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
		this._onChildAddCallbacks = this._onChildAddCallbacks || [];
		this._onChildAddCallbacks.push(callback);
	}
	runOnChildAddCallbacks(node: BaseNodeType) {
		this._runCallbacksWithChildNode(this._onChildAddCallbacks, node);
	}

	//
	//
	// ON CHILD REMOVE
	//
	//
	onChildRemove(callback: CallbackWithChildNode) {
		this._onChildRemoveCallbacks = this._onChildRemoveCallbacks || [];
		this._onChildRemoveCallbacks.push(callback);
	}
	runOnChildRemoveCallbacks(node: BaseNodeType) {
		this._runCallbacksWithChildNode(this._onChildRemoveCallbacks, node);
	}

	//
	//
	// ON CREATE
	//
	//
	onAfterCreated(callback: Callback) {
		this._onAfterCreatedCallbacks = this._onAfterCreatedCallbacks || [];
		this._onAfterCreatedCallbacks.push(callback);
	}
	runOnAfterCreatedCallbacks() {
		this._runCallbacks(this._onAfterCreatedCallbacks);
	}

	//
	//
	// ON ADD
	//
	//
	onAfterAdded(callback: Callback) {
		this._onAfterAddedCallbacks = this._onAfterAddedCallbacks || [];
		this._onAfterAddedCallbacks.push(callback);
	}
	runOnAfterAddedCallbacks() {
		this._runCallbacks(this._onAfterAddedCallbacks);
	}

	//
	//
	// ON DELETE
	//
	//
	onBeforeDeleted(callback: Callback) {
		this._onBeforeDeletedCallbacks = this._onBeforeDeletedCallbacks || [];
		this._onBeforeDeletedCallbacks.push(callback);
	}
	runOnBeforeDeleteCallbacks() {
		this._runCallbacks(this._onBeforeDeletedCallbacks);
	}
	// TODO: onAfterDeleted is not very different than methods in .dispose
	// so this should probably be removed/refactored
	onAfterDeleted(callback: Callback) {
		this._onAfterDeletedCallbacks = this._onAfterDeletedCallbacks || [];
		this._onAfterDeletedCallbacks.push(callback);
	}
	runOnDeleteCallbacks() {
		this._runCallbacks(this._onAfterDeletedCallbacks);
	}

	//
	//
	// UTILS
	//
	//
	protected _runCallbacks(hooks: Callback[] | undefined) {
		if (!hooks) {
			return;
		}
		let hook: Callback | undefined;
		// do not flush, as this MAY BE needed multiple times
		for (hook of hooks) {
			hook();
		}
	}
	protected _runCallbacksWithChildNode(hooks: CallbackWithChildNode[] | undefined, childNode: BaseNodeType) {
		if (!hooks) {
			return;
		}
		let hook: CallbackWithChildNode | undefined;
		// do not flush, as this is needed multiple times
		for (hook of hooks) {
			hook(childNode);
		}
	}
}
