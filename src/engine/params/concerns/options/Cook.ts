import {BaseParam} from 'src/engine/params/_Base'

const COOK_OPTION = 'cook'

interface ParamOptions {
	cook?: boolean
}

export function CookOption<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_options: ParamOptions
		protected self: BaseParam = (<unknown>this) as BaseParam

		makes_node_dirty_when_dirty() {
			let cook_options

			// false as the dirty state will go through the parent param
			if (this.self.parent_param() != null) {
				return false
			}

			let value = true
			if ((cook_options = this._options[COOK_OPTION]) != null) {
				value = cook_options
			}
			return value
		}
	}
}
