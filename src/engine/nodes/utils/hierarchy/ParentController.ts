import {BaseNodeType} from '../../_Base';
import {NodeTypeMap} from '../../../containers/utils/ContainerMap';

type Callback = () => void;
import {CoreWalker} from '../../../../core/Walker';
import {NodeContext} from '../../../poly/NodeContext';

export class HierarchyParentController {
	private _parent: BaseNodeType | null = null;
	private _on_set_parent_hooks: Callback[] | undefined;

	constructor(protected node: BaseNodeType) {}

	parent() {
		return this._parent;
	}

	setParent(parent: BaseNodeType | null) {
		if (parent != this.node.parentController.parent()) {
			this._parent = parent;
			if (this._parent) {
				this.node.nameController.requestNameToParent(this.node.name());
			}
		}
	}
	firstAncestorWithContext<N extends NodeContext>(context: N): NodeTypeMap[N] | null {
		if (this._parent) {
			if (this._parent.context() == context) {
				return this._parent as NodeTypeMap[N];
			} else {
				return this._parent.parentController.firstAncestorWithContext(context);
			}
		}
		return null;
	}

	path(relative_to_parent?: BaseNodeType): string {
		const separator = CoreWalker.SEPARATOR;
		if (this._parent != null) {
			if (this._parent == relative_to_parent) {
				return this.node.name();
			} else {
				const parent_fullPath = this._parent.path(relative_to_parent);
				if (parent_fullPath === separator) {
					return parent_fullPath + this.node.name();
				} else {
					return parent_fullPath + separator + this.node.name();
				}
			}
		} else {
			return separator;
		}
	}

	onSetParent() {
		if (this._on_set_parent_hooks) {
			for (let hook of this._on_set_parent_hooks) {
				hook();
			}
		}
	}
	findNode(path: string | null): BaseNodeType | null {
		if (path == null) {
			return null;
		}
		if (path == CoreWalker.CURRENT || path == CoreWalker.CURRENT_WITH_SLASH) {
			return this.node;
		}
		if (path == CoreWalker.PARENT || path == CoreWalker.PARENT_WITH_SLASH) {
			return this.node.parent();
		}

		const separator = CoreWalker.SEPARATOR;
		if (path === separator) {
			return this.node.scene().root();
		}
		if (path[0] === separator) {
			path = path.substring(1, path.length);
			return this.node.scene().root().node(path);
		}

		// check that path is a string, since there has been errors where it wasn't the case
		if (path.split) {
			const elements = path.split(separator);
			if (elements.length === 1) {
				const name = elements[0];
				if (this.node.childrenController) {
					return this.node.childrenController.childByName(name);
				} else {
					return null;
				}
			} else {
				return CoreWalker.findNode(this.node, path);
			}
		} else {
			console.error('unexpected path given:', path);
			return null;
		}
	}
}
