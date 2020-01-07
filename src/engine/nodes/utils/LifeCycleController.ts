import {BaseNode} from 'src/engine/nodes/_Base';

type Callback = (node: BaseNode) => void;

export class LifeCycleController {
	protected _on_child_add_hook: Callback[] = [];
	// private _on_child_remove_hook: Callback[] = [];
	// private _on_create_hook: Callback[] = [];
	// private _on_delete_hook: Callback[] = [];
	constructor(protected node: BaseNode) {}

	add_on_child_add_hook(callback: Callback) {
		this._on_child_add_hook.push(callback);
	}
	execute_on_child_add_hooks() {
		this.execute_hooks(this._on_child_add_hook);
	}

	protected execute_hooks(hooks: Callback[]) {
		for (let hook of hooks) {
			hook(this.node);
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
