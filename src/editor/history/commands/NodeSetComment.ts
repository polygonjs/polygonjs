import {BaseCommand} from './_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class NodeSetCommentCommand extends BaseCommand {
	private _old_comment: string | undefined;

	constructor(private _node: BaseNodeType, private _new_comment: string) {
		super();
		this._old_comment = this._node.ui_data.comment;
	}

	do() {
		this._node.ui_data.set_comment(this._new_comment);
	}

	undo() {
		this._node.ui_data.set_comment(this._old_comment);
	}
}
