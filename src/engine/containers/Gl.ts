import {TypedContainer} from './_Base';
import {NodeContext} from '../poly/NodeContext';

export class GlContainer extends TypedContainer<NodeContext.GL> {
	object() {
		return this._content;
	}
}
