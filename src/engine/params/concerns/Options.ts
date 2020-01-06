// import Callback from './Option/Callback';
// import Color from './Option/Color';
// import Cook from './Option/Cook';
// import Expression from './Option/Expression';
// import Menu from './Option/Menu';
// import Range from './Option/Range';
// import Multiline from './Option/Multiline';
// import Texture from './Option/Texture';
// import Visible from './Option/Visible';

import lodash_each from 'lodash/each'
import lodash_keys from 'lodash/keys'
import lodash_isEqual from 'lodash/isEqual'
import lodash_cloneDeep from 'lodash/cloneDeep'

export interface ParamOptions {
	// visible?: boolean
	[propName: string]: any
}

export function Options<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// this.dependencies = [
		// 	Callback,
		// 	Color,
		// 	Cook,
		// 	Expression,
		// 	Menu,
		// 	Range,
		// 	Multiline,
		// 	Texture,
		// 	Visible
		// ];
		// @Callback = Callback
		// @Cook = Cook
		// @Expression = Expression
		// @Menu = Menu
		// @Range = Range
		// @Multiline = Multiline
		// @Texture = Texture
		// @Visible = Visible

		_options: ParamOptions
		_default_options: ParamOptions

		set_options(options: ParamOptions) {
			this._options = options
			return this._init_options()
		}
		private _init_options() {
			this._default_options = lodash_cloneDeep(this._options)
			// this._visible = true;
		}
		options() {
			return this._options
		}
		has_options_overridden(): boolean {
			return !lodash_isEqual(this._options, this._default_options)
		}
		overridden_options(): ParamOptions {
			const hash: ParamOptions = {}
			const option_names = lodash_keys(this._options)
			lodash_each(option_names, (option_name) => {
				if (
					!lodash_isEqual(
						this._options[option_name],
						this._default_options[option_name]
					)
				) {
					return (hash[option_name] = lodash_cloneDeep(
						this._options[option_name]
					))
				}
			})
			return hash
		}
		set_option(name: string, value: any) {
			return (this._options[name] = value)
		}
	}
}
