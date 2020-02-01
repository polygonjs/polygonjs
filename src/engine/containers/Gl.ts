import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class GlContainer extends TypedContainer<ContainableMap['GL']> {
	// constructor() {
	// 	super();
	// }

	object() {
		return this._content;
	}
}
