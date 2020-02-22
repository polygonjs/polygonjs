import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class JsContainer extends TypedContainer<ContainableMap['JS']> {
	object() {
		return this._content;
	}
}
