import {BaseNode} from 'src/engine/nodes/_Base';

type Callback = (node: BaseNode) => void;
type CallbackWithChildNode = (node: BaseNode, child_node: BaseNode) => void;

export class LifeCycleController {
	protected _on_child_add_hooks: CallbackWithChildNode[] = [];
	private _on_child_remove_hooks: CallbackWithChildNode[] = [];
	private _on_create_hooks: Callback[] = [];
	private _on_delete_hooks: Callback[] = [];
	constructor(protected node: BaseNode) {}

	add_on_child_add_hook(callback: CallbackWithChildNode) {
		this._on_child_add_hooks.push(callback);
	}
	on_child_add(node: BaseNode) {
		this.execute_hooks_with_child_node(this._on_child_add_hooks, node);
	}

	add_on_child_remove_hook(callback: CallbackWithChildNode) {
		this._on_child_remove_hooks.push(callback);
	}
	on_child_remove(node: BaseNode) {
		this.execute_hooks_with_child_node(this._on_child_add_hooks, node);
	}

	add_create_hook(callback: Callback) {
		this._on_create_hooks.push(callback);
	}
	on_create() {
		this.execute_hooks(this._on_create_hooks);
	}

	add_delete_hook(callback: Callback) {
		this._on_delete_hooks.push(callback);
	}
	on_delete() {
		this.execute_hooks(this._on_delete_hooks);
	}

	protected execute_hooks(hooks: Callback[]) {
		for (let hook of hooks) {
			hook(this.node);
		}
	}
	protected execute_hooks_with_child_node(hooks: CallbackWithChildNode[], child_node: BaseNode) {
		for (let hook of hooks) {
			hook(this.node, child_node);
		}
	}
}

// export function LifeCycle<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseNode = (<unknown>this) as BaseNode;
// 		on_child_add(node: BaseNode) {}
// 		//console.log("A #{this.full_path()} lifecycle on_add_child", node)
// 		on_child_remove(node: BaseNode) {}
// 		//console.log("A #{this.full_path()} lifecycle on_child_remove", node)

// 		on_create() {}
// 		//
// 		on_delete() {}
// 	};
// }
