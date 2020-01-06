import {BaseContainer} from './_Base'

export class GlContainer extends BaseContainer<null> {
	constructor() {
		super()
	}

	object() {
		return this._content
	}
}
