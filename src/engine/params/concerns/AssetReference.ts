import {BaseParam} from '../_Base'

export function AssetReference<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseParam = (<unknown>this) as BaseParam

		private _referenced_asset: string = null

		reset_referenced_asset() {
			this._referenced_asset = null
		}

		mark_as_referencing_asset(url: string) {
			if (this.self.always_reference_asset()) {
			}
			this._referenced_asset = url
		}

		referenced_asset(): string {
			if (this.self.always_reference_asset()) {
				return this.self.value()
			} else {
				return this._referenced_asset
			}
		}

		is_referencing_asset(): boolean {
			return (
				this.self.always_reference_asset() ||
				this._referenced_asset != null
			)
		}
	}
}
