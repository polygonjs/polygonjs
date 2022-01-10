import {CoreGraphNode} from './CoreGraphNode';
import {CoreGraphNodeId} from './CoreGraph';
import {Poly} from '../../engine/Poly';

export type PostDirtyHook = (caller?: CoreGraphNode) => void;

export class DirtyController {
	_dirty_count: number = 0;
	_dirty: boolean = true;
	_dirty_timestamp: number | undefined;
	_cached_successors: CoreGraphNode[] | undefined;
	_forbidden_trigger_node_ids: Set<CoreGraphNodeId> | undefined;

	// hooks
	_post_dirty_hooks: PostDirtyHook[] | undefined;
	_post_dirty_hook_names: string[] | undefined;

	constructor(private node: CoreGraphNode) {}

	dispose() {
		this._cached_successors = undefined;
		this._post_dirty_hooks = undefined;
		this._post_dirty_hook_names = undefined;
	}

	isDirty(): boolean {
		return this._dirty === true;
	}
	dirtyTimestamp() {
		return this._dirty_timestamp;
	}
	dirtyCount(): number {
		return this._dirty_count;
	}
	addPostDirtyHook(name: string, method: PostDirtyHook) {
		this._post_dirty_hook_names = this._post_dirty_hook_names || [];
		this._post_dirty_hooks = this._post_dirty_hooks || [];

		if (!this._post_dirty_hook_names.includes(name)) {
			this._post_dirty_hook_names.push(name);
			this._post_dirty_hooks.push(method);
		} else {
			console.warn(`hook with name ${name} already exists`, this.node);
		}
	}
	removePostDirtyHook(name: string) {
		if (this._post_dirty_hook_names && this._post_dirty_hooks) {
			const index = this._post_dirty_hook_names.indexOf(name);
			if (index >= 0) {
				this._post_dirty_hook_names.splice(index, 1);
				this._post_dirty_hooks.splice(index, 1);
			}
		}
	}
	hasHook(name: string): boolean {
		if (this._post_dirty_hook_names) {
			return this._post_dirty_hook_names.includes(name);
		}
		return false;
	}

	removeDirtyState(): void {
		this._dirty = false;
	}
	setForbiddenTriggerNodes(nodes: CoreGraphNode[]) {
		if (this._forbidden_trigger_node_ids) {
			this._forbidden_trigger_node_ids.clear();
		} else {
			this._forbidden_trigger_node_ids = new Set();
		}
		for (let node of nodes) {
			this._forbidden_trigger_node_ids.add(node.graphNodeId());
			node.dirtyController.clearSuccessorsCacheWithPredecessors();
		}
	}
	isForbiddenTriggerNodeId(nodeId: CoreGraphNodeId) {
		return this._forbidden_trigger_node_ids != null && this._forbidden_trigger_node_ids.has(nodeId);
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
		const performance = Poly.performance.performanceManager();
		this._dirty_timestamp = performance.now();
		this._dirty_count += 1;

		this.runPostDirtyHooks(original_trigger_graph_node);

		if (propagate === true) {
			this.setSuccessorsDirty(original_trigger_graph_node);
		}
	}

	runPostDirtyHooks(original_trigger_graph_node?: CoreGraphNode) {
		if (this._post_dirty_hooks) {
			const cooker = this.node.scene().cooker;
			if (cooker.blocked()) {
				cooker.enqueue(this.node, original_trigger_graph_node);
			} else {
				for (let hook of this._post_dirty_hooks) {
					hook(original_trigger_graph_node);
				}
			}
		}
	}

	setSuccessorsDirty(original_trigger_graph_node?: CoreGraphNode): void {
		const propagate = false;
		this._cached_successors = this._cached_successors || this.node.graphAllSuccessors();

		for (let successor of this._cached_successors) {
			successor.dirtyController.setDirty(original_trigger_graph_node, propagate);
		}
	}

	clearSuccessorsCache() {
		this._cached_successors = undefined;
	}
	clearSuccessorsCacheWithPredecessors() {
		this.clearSuccessorsCache();
		for (let predecessor of this.node.graphAllPredecessors()) {
			predecessor.dirtyController.clearSuccessorsCache();
		}
	}
}
