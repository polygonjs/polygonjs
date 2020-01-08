import {BaseParam} from '../_Base';

export class AssetsController {
	private _referenced_asset: string = null;
	constructor(protected param: BaseParam) {}

	reset_referenced_asset() {
		this._referenced_asset = null;
	}

	mark_as_referencing_asset(url: string) {
		if (this.param.options.always_reference_asset()) {
		}
		this._referenced_asset = url;
	}

	referenced_asset(): string {
		if (this.param.options.always_reference_asset()) {
			return this.param.value();
		} else {
			return this._referenced_asset;
		}
	}

	is_referencing_asset(): boolean {
		return this.param.options.always_reference_asset() || this._referenced_asset != null;
	}
}
