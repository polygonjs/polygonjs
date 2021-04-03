import {NodeEvent} from '../../../poly/NodeEvent';
import {BaseState} from './Base';
import {Poly} from '../../../Poly';

export class NodeErrorState extends BaseState {
	private _message: string | undefined;

	set(message: string | undefined) {
		if (this._message != message) {
			if (message) {
				Poly.warn(`[${this.node.path()}] error: '${message}'`);
			}
			this._message = message;
			this.on_update();
		}
	}
	message() {
		return this._message;
	}
	clear() {
		this.set(undefined);
	}
	active(): boolean {
		return this._message != null;
	}

	protected on_update() {
		if (this._message != null) {
			// console.warn("new error", message, this.self.path())
			this.node.setContainer(null, `from error '${this._message}'`);
		}

		this.node.emit(NodeEvent.ERROR_UPDATED);
	}
}
