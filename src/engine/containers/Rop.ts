import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class RopContainer extends TypedContainer<NodeContext.ROP> {
	set_content(content: ContainableMap[NodeContext.ROP]) {
		super.set_content(content);
	}
	renderer() {
		return this._content;
	}
}
