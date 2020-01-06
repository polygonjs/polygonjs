import {BaseContainer} from './_Base'

export class PostProcessContainer extends BaseContainer<any> {
	_content: any

	constructor() {
		super()
	}

	render_pass() {
		return this._content
	}

	object(options = {}) {
		return this.render_pass()
	}

	infos() {
		if (this._content != null) {
			return [this._content]
		}
	}
}
