import {BaseNodeType} from '../../_Base';
import {NameController} from '../NameController';

type Callback = () => void;
import {CoreWalker} from '../../../../core/Walker';

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
				this.node.name_controller.request_name_to_parent(NameController.base_name(this.node));
			}
		}
	}
	is_selected(): boolean {
		return this.parent?.children_controller?.selection?.contains(this.node) || false;
	}
	full_path(relative_to_parent?: BaseNodeType): string {
		const separator = CoreWalker.SEPARATOR;
		if (this._parent != null) {
			if (this._parent == relative_to_parent) {
				return this.node.name;
			} else {
				const parent_full_path = this._parent.full_path(relative_to_parent);
				if (parent_full_path === separator) {
					return parent_full_path + this.node.name;
				} else {
					return parent_full_path + separator + this.node.name;
				}
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
	find_node(path: string | null): BaseNodeType | null {
		if (path == null) {
			return null;
		}
		if (path == CoreWalker.CURRENT || path == CoreWalker.CURRENT_WITH_SLASH) {
			return this.node;
		}
		if (path == CoreWalker.PARENT || path == CoreWalker.PARENT_WITH_SLASH) {
			return this.node.parent;
		}

		const separator = CoreWalker.SEPARATOR;
		if (path[0] === separator) {
			path = path.substring(1, path.length);
		}

		// check that path is a string, since there has been errors where it wasn't the case
		if (path.split) {
			const elements = path.split(separator);
			if (elements.length === 1) {
				const name = elements[0];
				if (this.node.children_controller) {
					return this.node.children_controller.child_by_name(name);
				} else {
					return null;
				}
			} else {
				return CoreWalker.find_node(this.node, path);
			}
		} else {
			console.error('unexpected path given:', path);
			return null;
		}
	}
}
