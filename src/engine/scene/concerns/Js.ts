export function Js<TBase extends Constructor>(Base: TBase) {
	return class extends Base {
		_js_version: string

		set_js_version(version: string) {
			this._js_version = version
		}

		js_version() {
			return this._js_version
		}
	}
}
