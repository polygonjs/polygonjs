import {TypedNode} from '../_Base';

export class DisplayNodeController {
	_display_node: TypedNode<any, any>;
	constructor(protected node: TypedNode<any, any>) {}

	get display_node() {
		return this._display_node;
	}
	set_display_node(node: TypedNode<any, any>) {
		this._display_node = node;
	}
}
