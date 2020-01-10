import {TypedContainer} from './_Base';

export class PostProcessContainer extends TypedContainer<any> {
	_content: any;

	// constructor() {
	// 	super();
	// }

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
