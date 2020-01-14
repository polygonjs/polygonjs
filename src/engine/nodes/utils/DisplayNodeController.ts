import {BaseNodeType} from '../_Base';

export class DisplayNodeController {
	_display_node: BaseNodeType;
	constructor(protected node: BaseNodeType) {}

	get display_node() {
		return this._display_node;
	}
	set_display_node(node: BaseNodeType) {
		this._display_node = node;
	}
}
