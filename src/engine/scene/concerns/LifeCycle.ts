import {PolyScene} from 'src/engine/scene/PolyScene'

export function LifeCycle<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: PolyScene = (<unknown>this) as PolyScene

		private _lifecycle_on_create_allowed: boolean = true

		on_create_lifecycle_hook_allowed(): boolean {
			return this.self.loaded() && this._lifecycle_on_create_allowed == true
		}

		lifecycle_on_create_prevent(callback: () => void) {
			this._lifecycle_on_create_allowed = false
			callback()
			this._lifecycle_on_create_allowed = true
		}
	}
}
