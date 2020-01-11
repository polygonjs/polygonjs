import {BaseNode} from 'src/engine/nodes/_Base';
// import lodash_includes from 'lodash/includes';
// import lodash_values from 'lodash/values';

export class ErrorState {
	private _message: string | null;
	constructor(protected node: BaseNode) {}

	set(message: string | null) {
		if (this._message != message) {
			this._message = message;
			this.on_update();
		}
	}
	get message() {
		return this._message;
	}
	clear() {
		this.set(null);
	}
	get active(): boolean {
		return this._message != null;
	}

	protected on_update() {
		if (this._message != null) {
			// console.warn("new error", message, this.self.full_path())
			this.node.set_container(null, `from error '${this._message}'`);
		}

		this.node.emit(NodeEvent.ERROR_UPDATED);
	}
}

// export function Errored<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseNode = (<unknown>this) as BaseNode;

// 		_error_message: string = null;

// 		// _init_error() {
// 		// 	return this._error_message = null;
// 		// }

// 		set_error(message: string) {
// 			const old_error_message = this._error_message;

// 			if (message != null) {
// 				if (this._error_message == null) {
// 					this._error_message = message;
// 				}
// 			} else {
// 				this._error_message = null;
// 			}

// 			// if end_cook is specified here when there's no message, this messes up with events, cook_time
// 			if (message != null) {
// 				// console.warn("new error", message, this.self.full_path())
// 				this.self.set_container(null, `from error '${this._error_message}'`);
// 			}

// 			if (this._error_message !== old_error_message) {
// 				this.self.emit('node_error_updated');
// 			}
// 		}

// 		clear_error() {
// 			this.set_error(null);
// 		}
// 		is_errored(): boolean {
// 			return this._error_message != null;
// 		}
// 		error_message(): string {
// 			return this._error_message;
// 		}
// 	};
// }
