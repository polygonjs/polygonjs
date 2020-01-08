import {BaseNode} from 'src/engine/nodes/_Base';
import {NameController} from '../NameController';

type Callback = () => void;
import {CoreWalker} from 'src/core/Walker';

export class HierarchyParentController {
	private _parent: BaseNode;
	private _on_set_parent_hooks: Callback[];

	constructor(protected node: BaseNode) {}

	get parent() {
		return this._parent;
	}

	set_parent(parent: BaseNode) {
		if (parent != this.node.parent_controller.parent) {
			this._parent = parent;
			if (this._parent) {
				this.node.set_scene(parent.scene());
				this.node.request_name_to_parent(NameController.base_name(this.node));
			}
			// this.on_set_parent();
		}
	}
	is_selected() {
		return this.parent?.selection?.contains(this.node);
	}
	full_path(): string {
		const separator = CoreWalker.SEPARATOR;
		if (this._parent != null) {
			const parent_full_path = this._parent.full_path();
			if (parent_full_path === separator) {
				return parent_full_path + this.node.name();
			} else {
				return parent_full_path + separator + this.node.name();
			}
		} else {
			return separator;
		}
	}

	on_set_parent() {
		if (this._on_set_parent_hooks) {
			for (let hook of this._on_set_parent_hooks) {
				hook();
			}
		}
	}
}
