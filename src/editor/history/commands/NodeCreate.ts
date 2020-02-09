import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {Vector2} from 'three/src/math/Vector2';

export class NodeCreateCommand extends BaseCommand {
	private _node: BaseNodeType | undefined;

	constructor(private _parent: BaseNodeType, private _node_type: string, private _node_pos: Vector2) {
		super();
	}

	do() {
		this._node = this._parent.create_node(this._node_type);
		if (this._node) {
			this._node.ui_data.set_position(this._node_pos);
		}
	}

	undo() {
		if (this._node) {
			this._parent.remove_node(this._node);
		}
	}
}
