import {CoreGraphNode} from './CoreGraphNode';

export type PostDirtyHook = (caller?: CoreGraphNode) => void;

export class DirtyController {
	_dirty_count: number = 0;
	_dirty: boolean = true;
	_dirty_timestamp: number | undefined;
	_cached_successors: CoreGraphNode[] | undefined;
	_forbidden_trigger_nodes: string[] | undefined;

	// hooks
	_post_dirty_hooks: PostDirtyHook[] | undefined;
	_post_dirty_hook_names: string[] | undefined;

	constructor(private node: CoreGraphNode) {}

	get is_dirty(): boolean {
		return this._dirty === true;
	}
	get dirty_timestamp() {
		return this._dirty_timestamp;
	}
	get dirty_count(): number {
		return this._dirty_count;
	}
	add_post_dirty_hook(name: string, method: PostDirtyHook) {
		this._post_dirty_hook_names = this._post_dirty_hook_names || [];
		this._post_dirty_hooks = this._post_dirty_hooks || [];

		if (!this._post_dirty_hook_names.includes(name)) {
			this._post_dirty_hook_names.push(name);
			this._post_dirty_hooks.push(method);
		} else {
			console.warn(`hook with name ${name} already exists`, this.node);
		}
	}
	remove_post_dirty_hook(name: string) {
		if (this._post_dirty_hook_names && this._post_dirty_hooks) {
			const index = this._post_dirty_hook_names.indexOf(name);
			if (index >= 0) {
				this._post_dirty_hook_names.splice(index, 1);
				this._post_dirty_hooks.splice(index, 1);
			}
		}
	}
	has_hook(name: string): boolean {
		if (this._post_dirty_hook_names) {
			return this._post_dirty_hook_names.includes(name);
		}
		return false;
	}

	remove_dirty_state(): void {
		this._dirty = false;
	}
	set_forbidden_trigger_nodes(nodes: CoreGraphNode[]) {
		this._forbidden_trigger_nodes = nodes.map((n) => n.graph_node_id);
	}

	set_dirty(original_trigger_graph_node?: CoreGraphNode | null, propagate?: boolean): void {
		if (propagate == null) {
			propagate = true;
		}
		if (
			original_trigger_graph_node &&
			this._forbidden_trigger_nodes &&
			this._forbidden_trigger_nodes.includes(original_trigger_graph_node.graph_node_id)
		) {
			return;
		}

		if (original_trigger_graph_node == null) {
			original_trigger_graph_node = this.node;
		}

		this._dirty = true;
		this._dirty_timestamp = performance.now();
		this._dirty_count += 1;

		this.run_post_dirty_hooks(original_trigger_graph_node);

		if (propagate === true) {
			this.set_successors_dirty(original_trigger_graph_node);
		}
	}

	run_post_dirty_hooks(original_trigger_graph_node?: CoreGraphNode) {
		if (this._post_dirty_hooks) {
			const cooker = this.node.scene.cooker;
			if (cooker.blocked) {
				cooker.enqueue(this.node, original_trigger_graph_node);
			} else {
				for (let hook of this._post_dirty_hooks) {
					hook(original_trigger_graph_node);
				}
			}
		}
	}

	set_successors_dirty(original_trigger_graph_node?: CoreGraphNode): void {
		const propagate = false;
		this._cached_successors = this._cached_successors || this.node.graph_all_successors();

		for (let successor of this._cached_successors) {
			successor.dirty_controller.set_dirty(original_trigger_graph_node, propagate);
		}
	}

	clear_successors_cache() {
		this._cached_successors = undefined;
	}
	clear_successors_cache_with_predecessors() {
		this.clear_successors_cache();
		for (let predecessor of this.node.graph_all_predecessors()) {
			predecessor.dirty_controller.clear_successors_cache();
		}
	}
}
