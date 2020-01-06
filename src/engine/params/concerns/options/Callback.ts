import {BaseParam} from 'src/engine/params/_Base'

const CALLBACK_OPTION = 'callback'
const CALLBACK_STRING_OPTION = 'callback_string'
interface ParamOptions {
	callback?: (param: BaseParam) => any
	callback_string?: string
}

export function CallbackOption<TBase extends Constructor, T>(Base: TBase) {
	return class Mixin extends Base {
		_options: ParamOptions
		protected self: BaseParam = (<unknown>this) as BaseParam

		has_callback() {
			return (
				this._options[CALLBACK_OPTION] != null ||
				this._options[CALLBACK_STRING_OPTION] != null
			)
		}

		execute_callback() {
			const callback = this._get_callback()
			if (callback != null) {
				if (this.self.node() && !this.self.node().is_cooking()) {
					callback(this.self)
				}
			}
		}
		_get_callback() {
			if (this.has_callback()) {
				return (this._options[CALLBACK_OPTION] =
					this._options[CALLBACK_OPTION] ||
					this._create_callback_from_string())
			}
		}
		_create_callback_from_string() {
			const callback_string = this._options[CALLBACK_STRING_OPTION]
			const callback_function = new Function(
				'node',
				'scene',
				'window',
				'location',
				callback_string
			)
			return () => {
				callback_function(
					this.self.node(),
					this.self.scene(),
					null,
					null
				)
			}
		}
	}
}
