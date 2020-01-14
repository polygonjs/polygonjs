import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';

export class PostProcessContainer extends TypedContainer<ContainableMap['POST']> {
	// _content: any;

	// constructor() {
	// 	super();
	// }
	set_content(content: ContainableMap['POST']) {
		super.set_content(content);
	}
	render_pass() {
		return this._content;
	}

	object(options = {}) {
		return this.render_pass();
	}

	// infos() {
	// 	if (this._content) {
	// 		return [this._content];
	// 	}
	// }
}
