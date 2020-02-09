import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class SetDisplayFlagCommand extends BaseCommand {
	private _first_node: BaseNodeType | undefined;
	private _old_node: BaseNodeType | undefined;
	private _new_display_state: boolean | undefined;

	constructor(private _nodes: BaseNodeType[]) {
		super();
		this._first_node = this._nodes[0];
		if (this._first_node) {
			const parent = this._first_node.parent;
			if (parent) {
				if (parent.display_node_controller) {
					this._old_node = parent.display_node_controller.display_node;
				} else {
					this._new_display_state = !this._first_node.flags?.display?.active;
				}
			}
		}
	}

	do() {
		if (this._first_node && this._first_node.parent) {
			if (this._first_node.parent.display_node_controller) {
				this._first_node.flags?.display?.set(true);
				// for (let node of this._nodes) {
				// 	node.flags?.display?.set(true);
				// }
			} else {
				if (this._new_display_state != null) {
					for (let node of this._nodes) {
						node.flags?.display?.set(this._new_display_state);
					}
				}
			}
		}
	}

	undo() {
		if (this._first_node) {
			if (this._old_node) {
				this._old_node.flags?.display?.set(true);
			} else {
				if (this._new_display_state != null) {
					for (let node of this._nodes) {
						node.flags?.display?.set(!this._new_display_state);
					}
				}
			}
		}
	}
}
