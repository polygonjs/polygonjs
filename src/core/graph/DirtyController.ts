import {CoreGraphNode} from './CoreGraphNode';
// import {CoreGraphNodeId} from './CoreGraph';
import {Poly} from '../../engine/Poly';

export type PostDirtyHook = (caller?: CoreGraphNode) => void;

export class DirtyController {
	_dirtyCount: number = 0;
	_dirty: boolean = true;
	_dirtyTimestamp: number | undefined;
	// _cachedSuccessors: CoreGraphNode[] | undefined;
	// _forbiddenTriggerNodeIds: Set<CoreGraphNodeId> | undefined;

	// hooks
	_postDirtyHooks: PostDirtyHook[] | undefined;
	_postDirtyHookNames: string[] | undefined;

	constructor(private node: CoreGraphNode) {}

	dispose() {
		// this._cachedSuccessors = undefined;
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
	// setForbiddenTriggerNodes(nodes: CoreGraphNode[]) {
	// 	if (this._forbiddenTriggerNodeIds) {
	// 		this._forbiddenTriggerNodeIds.clear();
	// 	} else {
	// 		this._forbiddenTriggerNodeIds = new Set();
	// 	}
	// 	for (const node of nodes) {
	// 		this._forbiddenTriggerNodeIds.add(node.graphNodeId());
	// 		node.clearCachesWithPredecessorsAndSuccessors();
	// 	}
	// }
	// isForbiddenTriggerNodeId(nodeId: CoreGraphNodeId) {
	// 	return this._forbiddenTriggerNodeIds != null && this._forbiddenTriggerNodeIds.has(nodeId);
	// }

	setDirty(originalTriggerGraphNode?: CoreGraphNode | null, propagate: boolean = true): void {
		// if (propagate == null) {
		// 	propagate = true;
		// }
		// if (originalTriggerGraphNode && this.isForbiddenTriggerNodeId(originalTriggerGraphNode.graphNodeId())) {
		// 	console.log('is forbidden', this.node, originalTriggerGraphNode);
		// 	return;
		// }

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
		const cooker = this.node.scene().graph.callbacksTriggerController;
		if (cooker.blocked()) {
			cooker.enqueue(this.node, originalTriggerGraphNode);
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

		this.node.scene().graph.callbacksTriggerController.block();

		const allSuccessors = this.node.graphAllSuccessors();
		for (const successor of allSuccessors) {
			successor.dirtyController.setDirty(originalTriggerGraphNode, false);
		}
		this.node.scene().graph.callbacksTriggerController.unblock();
	}
}
