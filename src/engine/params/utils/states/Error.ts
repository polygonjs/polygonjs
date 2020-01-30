import {BaseParamType} from 'src/engine/params/_Base';
// import lodash_includes from 'lodash/includes';
// import lodash_values from 'lodash/values';

export class ErrorState {
	private _message: string | undefined;
	constructor(protected node: BaseParamType) {}

	set(message: string | undefined) {
		if (this._message != message) {
			this._message = message;
		}
	}
	get message() {
		return this._message;
	}
	clear() {
		this.set(undefined);
	}
	get active(): boolean {
		return this._message != null;
	}
}
