import {NodeEvent} from '../../../poly/NodeEvent';
import {BaseState} from './Base';

export class ErrorState extends BaseState {
	private _message: string | undefined;

	set(message: string | undefined) {
		if (this._message != message) {
			console.warn('error', message, this.node.full_path());
			this._message = message;
			this.on_update();
		}
	}
	get message() {
		return this._message;
	}
	clear() {
		this.set(undefined);
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
