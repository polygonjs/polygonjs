import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import {TypeAssert} from 'src/engine/poly/Assert';

// OVERRIDE = 'OVERRIDE';
// ADD = 'ADD';
// REMOVE = 'REMOVE';

export enum SelectionMethod {
	OVERRIDE = 'OVERRIDE',
	ADD = 'ADD',
	REMOVE = 'REMOVE',
}

export class NodeSelectCommand extends BaseCommand {
	private _old_nodes: BaseNodeType[] | undefined;

	constructor(private _parent: BaseNodeType, private nodes: BaseNodeType[], private _method: SelectionMethod) {
		super();
		if (this._parent.children_allowed() && this._parent.children_controller) {
			this._old_nodes = this._parent.children_controller.selection.nodes();
		}
	}

	do() {
		if (this._parent.children_allowed() && this._parent.children_controller) {
			const selection = this._parent.children_controller.selection;
			switch (this._method) {
				case SelectionMethod.OVERRIDE:
					return selection.set(this.nodes);
				case SelectionMethod.ADD:
					return selection.add(this.nodes);
				case SelectionMethod.REMOVE:
					return selection.remove(this.nodes);
			}
			TypeAssert.unreachable(this._method);
		}
	}

	undo() {
		if (this._parent.children_allowed() && this._parent.children_controller) {
			if (this._old_nodes) {
				this._parent.children_controller.selection.set(this._old_nodes);
			}
		}
	}
}
