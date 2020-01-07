import {Cooker} from 'src/core/graph/Cooker'

export function CookerMixin<TBase extends Constructor>(Base: TBase) {
	return class extends Base {
		_cooker: Cooker

		_init_cooker() {
			this._cooker = new Cooker()
		}
		cooker() {
			return this._cooker
		}
		batch_update(callback: () => void) {
			this._cooker.block()

			callback()

			this._cooker.unblock()
		}
	}
}
