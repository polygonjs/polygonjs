import {TypedContainer} from './_Base';
import {NodeContext} from '../poly/NodeContext';

export class JsContainer extends TypedContainer<NodeContext.JS> {
	object() {
		return this._content;
	}
}
