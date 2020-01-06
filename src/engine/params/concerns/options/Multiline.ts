const MULTILINE_OPTION = 'multiline';

interface ParamOptions {
	multiline?: boolean
}


export function MultilineOption<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_options: ParamOptions

		is_multiline(): boolean {
			return this._options[MULTILINE_OPTION] === true;
		}
	}
};

