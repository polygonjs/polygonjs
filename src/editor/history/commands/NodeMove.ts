import {Vector2} from 'three/src/math/Vector2';
import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeMoveCommand extends BaseCommand {
	private _inverted_offset: Vector2 = new Vector2();
	constructor(private _nodes: BaseNodeType[], private _offset: Vector2) {
		super();
		this._inverted_offset.copy(this._offset).multiplyScalar(-1);
	}

	do() {
		this._nodes.forEach((node) => {
			node.ui_data.translate(this._offset, true);
		});
	}

	undo() {
		this._nodes.forEach((node) => {
			node.ui_data.translate(this._inverted_offset, true);
		});
	}
}
