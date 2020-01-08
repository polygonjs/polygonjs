import {BaseParam} from 'src/engine/params/_Base';
// import lodash_includes from 'lodash/includes';
// import lodash_values from 'lodash/values';

export class ErrorState {
	private _message: string;
	constructor(protected node: BaseParam) {}

	set(message: string) {
		if (this._message != message) {
			this._message = message;
		}
	}
	get message() {
		return this._message;
	}
	clear() {
		this.set(null);
	}
	get active(): boolean {
		return this._message != null;
	}
}
