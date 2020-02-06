import {BaseNodeType} from 'src/engine/nodes/_Base';
import {NameController} from '../NameController';

type Callback = () => void;
import {CoreWalker} from 'src/core/Walker';

export class HierarchyParentController {
	private _parent: BaseNodeType | null = null;
	private _on_set_parent_hooks: Callback[] | undefined;

	constructor(protected node: BaseNodeType) {}

	get parent() {
		return this._parent;
	}

	set_parent(parent: BaseNodeType | null) {
		if (parent != this.node.parent_controller.parent) {
			this._parent = parent;
			if (this._parent) {
				// this.node.set_scene(this._parent.scene);
				this.node.name_controller.request_name_to_parent(NameController.base_name(this.node));
			}
			// this.on_set_parent();
		}
	}
	is_selected(): boolean {
		return this.parent?.children_controller?.selection?.contains(this.node) || false;
	}
	full_path(): string {
		const separator = CoreWalker.SEPARATOR;
		if (this._parent != null) {
			const parent_full_path = this._parent.full_path();
			if (parent_full_path === separator) {
				return parent_full_path + this.node.name;
			} else {
				return parent_full_path + separator + this.node.name;
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
