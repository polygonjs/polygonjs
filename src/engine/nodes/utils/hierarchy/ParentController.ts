import {BaseNode} from 'src/engine/nodes/_Base';
import {NameController} from '../NameController';

export class HierarchyParentController {
	constructor(protected node: BaseNode) {}

	set_parent(parent: BaseNode) {
		this.node.parent = parent;
		if (parent != null) {
			this.node.set_scene(parent.scene());
			this.node.request_name_to_parent(NameController.base_name(this.node));
		}
	}
	is_selected() {
		return this.node.parent?.selection?.contains(this.self);
	}
}
