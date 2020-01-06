export function Errored<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		_error_message: string
		set_error(message: string) {
			if (this._error_message == null) {
				return (this._error_message = message)
			}
		}
		// this.node().set_error( "param '#{this.name()}' error: #{this.error_message()}" )
		is_errored() {
			return this._error_message != null
		}
		error_message() {
			return this._error_message
		}
		clear_error() {
			this._error_message = null
		}
	}
}
