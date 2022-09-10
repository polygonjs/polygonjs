import {CoreGraphNode} from './CoreGraphNode';
import {CoreGraphNodeId} from './CoreGraph';
import {Poly} from '../../engine/Poly';

export type PostDirtyHook = (caller?: CoreGraphNode) => void;

export class DirtyController {
	_dirtyCount: number = 0;
	_dirty: boolean = true;
	_dirtyTimestamp: number | undefined;
	_cachedSuccessors: CoreGraphNode[] | undefined;
	_forbiddenTriggerNodeIds: Set<CoreGraphNodeId> | undefined;

	// hooks
	_postDirtyHooks: PostDirtyHook[] | undefined;
	_postDirtyHookNames: string[] | undefined;

	constructor(private node: CoreGraphNode) {}

	dispose() {
		this._cachedSuccessors = undefined;
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
	setForbiddenTriggerNodes(nodes: CoreGraphNode[]) {
		if (this._forbiddenTriggerNodeIds) {
			this._forbiddenTriggerNodeIds.clear();
		} else {
			this._forbiddenTriggerNodeIds = new Set();
		}
		for (let node of nodes) {
			this._forbiddenTriggerNodeIds.add(node.graphNodeId());
			node.dirtyController.clearSuccessorsCacheWithPredecessors();
		}
	}
	isForbiddenTriggerNodeId(nodeId: CoreGraphNodeId) {
		return this._forbiddenTriggerNodeIds != null && this._forbiddenTriggerNodeIds.has(nodeId);
	}

	setDirty(original_trigger_graph_node?: CoreGraphNode | null, propagate?: boolean): void {
		if (propagate == null) {
			propagate = true;
		}
		if (original_trigger_graph_node && this.isForbiddenTriggerNodeId(original_trigger_graph_node.graphNodeId())) {
			return;
		}

		if (original_trigger_graph_node == null) {
			original_trigger_graph_node = this.node;
		}

		this._dirty = true;
		this._dirtyTimestamp = Poly.performance.performanceManager().now();
		this._dirtyCount += 1;

		this.runPostDirtyHooks(original_trigger_graph_node);

		if (propagate === true) {
			this.setSuccessorsDirty(original_trigger_graph_node);
		}
	}

	runPostDirtyHooks(original_trigger_graph_node?: CoreGraphNode) {
		if (!this._postDirtyHooks) {
			return;
		}
		const cooker = this.node.scene().cooker;
		if (cooker.blocked()) {
			cooker.enqueue(this.node, original_trigger_graph_node);
		} else {
			for (let hook of this._postDirtyHooks) {
				hook(original_trigger_graph_node);
			}
		}
	}

	setSuccessorsDirty(original_trigger_graph_node?: CoreGraphNode): void {
		if (original_trigger_graph_node == null) {
			original_trigger_graph_node = this.node;
		}
		const propagate = false;
		this._cachedSuccessors = this._cachedSuccessors || this.node.graphAllSuccessors();

		for (let successor of this._cachedSuccessors) {
			successor.dirtyController.setDirty(original_trigger_graph_node, propagate);
		}
	}

	clearSuccessorsCache() {
		this._cachedSuccessors = undefined;
	}
	clearSuccessorsCacheWithPredecessors() {
		this.clearSuccessorsCache();
		const predecessors = this.node.graphAllPredecessors();
		for (let predecessor of predecessors) {
			predecessor.dirtyController.clearSuccessorsCache();
		}
	}
}
