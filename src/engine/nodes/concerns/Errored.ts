import {BaseNode} from '../_Base';

export function Errored<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;

		_error_message: string = null;

		// _init_error() {
		// 	return this._error_message = null;
		// }

		set_error(message: string) {
			const old_error_message = this._error_message;

			if (message != null) {
				if (this._error_message == null) {
					this._error_message = message;
				}
			} else {
				this._error_message = null;
			}

			// if end_cook is specified here when there's no message, this messes up with events, cook_time
			if (message != null) {
				// console.warn("new error", message, this.self.full_path())
				this.self.set_container(null, `from error '${this._error_message}'`);
			}

			if (this._error_message !== old_error_message) {
				this.self.emit('node_error_updated');
			}
		}

		clear_error() {
			this.set_error(null);
		}
		is_errored(): boolean {
			return this._error_message != null;
		}
		error_message(): string {
			return this._error_message;
		}
	};
}
