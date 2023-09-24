import {CoreGraphNode} from './CoreGraphNode';
import {Poly} from '../../engine/Poly';
import {Cooker} from '../../engine/scene/utils/Cooker';

export type PostDirtyHook = (caller?: CoreGraphNode) => void;

export class DirtyController {
	private _dirtyCount: number = 0;
	private _dirty: boolean = true;
	private _dirtyTimestamp: number | undefined;
	private _cooker: Cooker;
	// hooks
	private _postDirtyHooks: PostDirtyHook[] | undefined;
	private _postDirtyHookNames: string[] | undefined;

	constructor(private node: CoreGraphNode) {
		this._cooker = node.scene().cooker;
	}

	dispose() {
		this._postDirtyHooks = undefined;
		this._postDirtyHookNames = undefined;
	}

	isDirty(): boolean {
		return this._dirty === true;
	}
	dirtyTimestamp() {
		return this._dirtyTimestamp;
	}
	dirtyCount(): number {
		return this._dirtyCount;
	}
	hasPostDirtyHooks(): boolean {
		return this._postDirtyHookNames != null && this._postDirtyHookNames.length > 0;
	}
	addPostDirtyHook(name: string, method: PostDirtyHook) {
		this._postDirtyHookNames = this._postDirtyHookNames || [];
		this._postDirtyHooks = this._postDirtyHooks || [];

		if (!this._postDirtyHookNames.includes(name)) {
			this._postDirtyHookNames.push(name);
			this._postDirtyHooks.push(method);
		} else {
			console.warn(`hook with name ${name} already exists`, this.node);
		}
	}
	removePostDirtyHook(name: string) {
		if (this._postDirtyHookNames && this._postDirtyHooks) {
			const index = this._postDirtyHookNames.indexOf(name);
			if (index >= 0) {
				this._postDirtyHookNames.splice(index, 1);
				this._postDirtyHooks.splice(index, 1);
			}
		}
	}
	hasHook(name: string): boolean {
		if (this._postDirtyHookNames) {
			return this._postDirtyHookNames.includes(name);
		}
		return false;
	}

	removeDirtyState(): void {
		this._dirty = false;
	}

	setDirty(originalTriggerGraphNode?: CoreGraphNode | null, propagate: boolean = true): void {
		if (originalTriggerGraphNode == null) {
			originalTriggerGraphNode = this.node;
		}
		if (originalTriggerGraphNode == this.node && this.node.selfDirtyForbidden()) {
			return;
		}
		this._dirty = true;
		this._dirtyTimestamp = Poly.performance.performanceManager().now();
		this._dirtyCount += 1;

		this.runPostDirtyHooks(originalTriggerGraphNode);

		if (propagate === true) {
			this.setSuccessorsDirty(originalTriggerGraphNode);
		}
	}

	runPostDirtyHooks(originalTriggerGraphNode?: CoreGraphNode) {
		if (this._postDirtyHooks == null || this._postDirtyHooks.length == 0) {
			return;
		}
		if (this._cooker.blocked()) {
			this._cooker.enqueue(this.node, originalTriggerGraphNode);
		} else {
			for (const hook of this._postDirtyHooks) {
				hook(originalTriggerGraphNode);
			}
		}
	}

	setSuccessorsDirty(originalTriggerGraphNode?: CoreGraphNode): void {
		if (originalTriggerGraphNode == null) {
			originalTriggerGraphNode = this.node;
		}

		this._cooker.block();

		const allSuccessors = this.node.graphAllSuccessors();
		for (const successor of allSuccessors) {
			successor.dirtyController.setDirty(originalTriggerGraphNode, false);
		}
		this._cooker.unblock();
	}
}
