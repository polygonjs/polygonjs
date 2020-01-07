import {BaseNode} from '../_Base';

export function HierarchyParentOwner<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		_parent: BaseNode;

		// _init_hierarchy_parent_owner() {
		// 	this._parent = null;
		// }

		// set_scene: (scene)->
		// 	@_scene = scene
		// scene: ->
		// 	@_scene
		set_parent(parent: BaseNode) {
			this._parent = parent;
			if (parent != null) {
				this.self.set_scene(parent.scene());
				this.self.request_name_to_parent(this.self.base_name());
			}
		}
		//this.post_set_parent()
		post_set_parent() {}
		//

		// parent() {
		// 	return this._parent;
		// }
		root() {
			return this.self._scene.root();
		}

		full_path(): string {
			if (this._parent != null) {
				const parent_full_path = this._parent.full_path();
				if (parent_full_path === '/') {
					return parent_full_path + this.self._name;
				} else {
					return parent_full_path + '/' + this.self._name;
				}
			} else {
				return '/';
			}
		}
	};
}
