const SPARE_OPTION = 'spare';

interface ParamOptions {
	spare?: boolean
}

export function SpareOption<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_options: ParamOptions

		is_spare() :boolean {
			return this._options[SPARE_OPTION] || false;
		}
	};
}

