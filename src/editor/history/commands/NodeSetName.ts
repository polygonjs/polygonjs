import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeSetNameCommand extends BaseCommand {
	private _old_name: string;

	constructor(private _node: BaseNodeType, private _new_name: string) {
		super();
		this._old_name = this._node.name;
	}

	do() {
		this._node.set_name(this._new_name);
	}

	undo() {
		this._node.set_name(this._old_name);
	}
}
