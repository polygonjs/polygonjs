// import lodash_filter from 'lodash/filter';
// import lodash_uniq from 'lodash/uniq';
// import lodash_flatten from 'lodash/flatten';
// import {Cooker} from './Cooker';
import {CoreGraphNode} from './CoreGraphNode';

// not sure how I can have caller: DirtyableMixin if DirtyableMixin is not yet defined
export type PostDirtyHook = (caller?: CoreGraphNode) => void;

// type Constructor<T = {}> = new (...args: any[]) => T;
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

	// _init_dirtyable(): void {
	// 	this._dirty_count = 0;
	// 	this._dirty = true;
	// }
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
	// using a dirty block doesn't quite work, as I would need to be able
	// to fetch the graph for all successors that haven't been blocked
	// block_dirty_propagation: ->
	// 	@_dirty_propagation_allowed = false
	// unblock_dirty_propagation: ->
	// 	@_dirty_propagation_allowed = true
	remove_dirty_state(): void {
		this._dirty = false;
	}
	set_forbidden_trigger_nodes(nodes: CoreGraphNode[]) {
		this._forbidden_trigger_nodes = nodes.map((n) => n.graph_node_id);
	}
	//@_clean_for_frame = this.context().frame()
	//this.post_remove_dirty_state(message)

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

	// cooker(): Cooker {
	// 	throw 'Dirtyable.cooker requires implementation';
	// }
	set_successors_dirty(original_trigger_graph_node?: CoreGraphNode): void {
		// const cooker = this.node.scene.cooker;
		// cooker.block();

		const propagate = false;
		this._cached_successors = this._cached_successors || this.node.graph_all_successors();

		// successors = successors.filter(n=>!n.is_dirty())
		for (let successor of this._cached_successors) {
			successor.dirty_controller.set_dirty(original_trigger_graph_node, propagate);
		}

		// cooker.unblock();
	}

	// _dirtyable_all_successors(original_trigger_graph_node: CoreGraphNode): CoreGraphNode[] {
	// 	return this.graph_all_predecessors()
	// 	// const successors = [];
	// 	// let newly_added_successors = this._dirtyable_direct_successors(original_trigger_graph_node);
	// 	// successors.push(newly_added_successors);

	// 	// while (newly_added_successors.length > 0) {
	// 	// 	newly_added_successors = lodash_flatten(
	// 	// 		newly_added_successors.map((newly_added_successor) => {
	// 	// 			return newly_added_successor._dirtyable_direct_successors(original_trigger_graph_node);
	// 	// 		})
	// 	// 	);
	// 	// 	successors.push(newly_added_successors);
	// 	// }

	// 	// return lodash_uniq(lodash_flatten(successors));
	// }

	clear_successors_cache() {
		this._cached_successors = undefined;
	}
	clear_successors_cache_with_predecessors() {
		this.clear_successors_cache();
		for (let predecessor of this.node.graph_all_predecessors()) {
			predecessor.dirty_controller.clear_successors_cache();
		}
	}
	// graph_all_predecessors(): CoreGraphNode[] {
	// 	return this.node.graph_all_predecessors()
	// 	// console.log('dirtyable graph_all_predecessors should be overwritten');
	// 	// return [];
	// }

	// dirty_successors(): Array<CoreGraphNode> {
	// 	throw 'Dirtyable.dirty_successors requires implementation';
	// }
	// set_dirty_allowed(original_trigger_graph_node: CoreGraphNode): boolean {
	// 	throw 'Dirtyable.set_dirty_allowed requires implementation';
	// }
	// _dirtyable_direct_successors(original_trigger_graph_node: CoreGraphNode): Array<CoreGraphNode> {
	// 	return this.dirty_successors().filter((successor) => {
	// 		return successor.set_dirty_allowed == null || successor.set_dirty_allowed(original_trigger_graph_node);
	// 	});
	// }

	// set_graph_successors_dirty_via_graph: (original_trigger_graph_node)->
	// 	cooker = this.scene().cooker()
	// 	cooker.block()

	// 	make_successors_dirty = false
	// 	lodash_each lodash_flatten(this.graph_all_successors()), (successor)=>
	// 		successor.set_dirty(original_trigger_graph_node, this, false)

	// 	cooker.unblock()

	// post_set_dirty(original_trigger_graph_node?: Dirtyable, direct_trigger_graph_node?: Dirtyable): void{}
}
