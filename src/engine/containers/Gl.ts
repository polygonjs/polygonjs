import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class GlContainer extends TypedContainer<ContainableMap['GL']> {
	object() {
		return this._content;
	}
}
