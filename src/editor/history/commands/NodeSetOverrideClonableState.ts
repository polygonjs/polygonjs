import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeSetOverrideClonableStateCommand extends BaseCommand {
	private _old_state: boolean;

	constructor(private _node: BaseNodeType, private _new_state: boolean) {
		super();
		this._old_state = this._node.io.inputs.override_clonable_state();
	}

	do() {
		this._node.io.inputs.set_override_clonable_state(this._new_state);
	}

	undo() {
		this._node.io.inputs.set_override_clonable_state(this._old_state);
	}
}
