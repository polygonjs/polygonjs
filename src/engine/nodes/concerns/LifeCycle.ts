import {BaseNode} from '../_Base';

export function LifeCycle<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		on_child_add(node: BaseNode) {}
		//console.log("A #{this.full_path()} lifecycle on_add_child", node)
		on_child_remove(node: BaseNode) {}
		//console.log("A #{this.full_path()} lifecycle on_child_remove", node)

		on_create() {}
		//
		on_delete() {}
	};
}
