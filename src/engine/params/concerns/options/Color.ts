const COLOR_OPTION = 'color';

interface ParamOptions {
	color?: [number, number, number] | string
}

export function ColorOption<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_options: ParamOptions
		color() {
			return this._options[COLOR_OPTION];
		}
	}
}
