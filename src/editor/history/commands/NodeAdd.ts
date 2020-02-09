import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeAddCommand extends BaseCommand {
	constructor(private _parent: BaseNodeType, private _node: BaseNodeType) {
		super();
	}

	do() {
		if (this._parent.children_allowed() && this._parent.children_controller) {
			this._parent.children_controller.add_node(this._node);
		}
	}

	undo() {
		this._parent.remove_node(this._node);
	}
}
