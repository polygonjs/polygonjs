import lodash_isString from 'lodash/isString';
import {BaseParamType} from '../_Base';

export class AssetsController {
	private _referenced_asset: string | null = null;
	constructor(protected param: BaseParamType) {}

	reset_referenced_asset() {
		this._referenced_asset = null;
	}

	mark_as_referencing_asset(url: string) {
		// TODO: typescript: doublecheck this could be commented out
		// if (this.param.options.always_reference_asset()) {
		// }
		this._referenced_asset = url;
	}

	referenced_asset(): string | null {
		if (this.param.options.always_reference_asset) {
			const val = this.param.value;
			if (lodash_isString(val)) {
				return val;
			}
			return null;
		} else {
			return this._referenced_asset;
		}
	}

	is_referencing_asset(): boolean {
		return this.param.options.always_reference_asset || this._referenced_asset != null;
	}
}
