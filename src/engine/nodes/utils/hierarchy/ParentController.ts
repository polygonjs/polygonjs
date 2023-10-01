import {BaseNodeType} from '../../_Base';
// import {NodeTypeMap} from '../../../containers/utils/ContainerMap';

type NodeParentControllerCallback = () => void;
import {CoreWalker} from '../../../../core/Walker';
import {BaseNodeByContextMap, NodeContext} from '../../../poly/NodeContext';

export class HierarchyParentController {
	private _parent: BaseNodeType | null = null;
	private _on_set_parent_hooks: NodeParentControllerCallback[] | undefined;

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
	firstAncestorWithContext<N extends NodeContext>(context: N): BaseNodeByContextMap[N] | null {
		if (this._parent) {
			if (this._parent.context() == context) {
				return this._parent as BaseNodeByContextMap[N];
			} else {
				return this._parent.parentController.firstAncestorWithContext(context);
			}
		}
		return null;
	}
	findParent(callback: (parent: BaseNodeType) => boolean): BaseNodeType | null {
		if (this._parent) {
			if (callback(this._parent) == true) {
				return this._parent;
			} else {
				return this._parent.parentController.findParent(callback);
			}
		}
		return null;
	}

	path(relativeToParent?: BaseNodeType): string {
		// if (this.node.disposed) {
		// 	console.warn('.path() called from a disposed node, this may return an invalid path', this.node);
		// }

		const separator = CoreWalker.SEPARATOR;
		if (this._parent != null) {
			if (this._parent == relativeToParent) {
				return this.node.name();
			} else {
				const parent_fullPath = this._parent.path(relativeToParent);
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
			for (const hook of this._on_set_parent_hooks) {
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
