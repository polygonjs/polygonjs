import {BaseNode} from '../_Base';

export class DisplayNodeController {
	_display_node: BaseNode;
	constructor(protected node: BaseNode) {}

	get display_node() {
		return this._display_node;
	}
	set_display_node(node: BaseNode) {
		this._display_node = node;
	}
}
