import {NodeEvent} from '../../../poly/NodeEvent';
import {BaseState} from './Base';
import {Poly} from '../../../Poly';

export class ErrorState extends BaseState {
	private _message: string | undefined;

	set(message: string | undefined) {
		if (this._message != message) {
			if (message) {
				Poly.warn('error', message, this.node.fullPath());
			}
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
			// console.warn("new error", message, this.self.fullPath())
			this.node.set_container(null, `from error '${this._message}'`);
		}

		this.node.emit(NodeEvent.ERROR_UPDATED);
	}
}
