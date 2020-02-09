import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class SetBypassFlagCommand extends BaseCommand {
	private _first_node: BaseNodeType | undefined;
	private _current_state: boolean | undefined;

	constructor(private _nodes: BaseNodeType[]) {
		super();
		this._first_node = _nodes[0];
		if (this._first_node) {
			this._current_state = this._first_node.flags?.bypass?.active;
		}
	}

	do() {
		if (this._first_node && this._current_state != null) {
			const cooker = this._first_node.scene.cooker;
			cooker.block();
			for (let node of this._nodes) {
				node.flags?.bypass?.set(!this._current_state);
			}
			cooker.unblock();
		}
	}

	undo() {
		if (this._first_node && this._current_state != null) {
			for (let node of this._nodes) {
				node.flags?.bypass?.set(this._current_state);
			}
		}
	}
}
