import {NodeEvent} from '../../../poly/NodeEvent';
import {BaseState} from './Base';
import {Poly} from '../../../Poly';
import {NodeContext} from '../../../poly/NodeContext';

export class NodeErrorState<NC extends NodeContext> extends BaseState<NC> {
	private _message: string | undefined;

	set(message: string | undefined) {
		if (this._message != message) {
			if (message) {
				Poly.error(`[${this.node.path()}] error: '${message}'`);
			}
			this._message = message;
			this.onUpdate();
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

	protected onUpdate() {
		if (this._message != null) {
			// console.warn("new error", message, this.self.path())
			this.node._setContainer(null as any, `from error '${this._message}'`);
		}

		this.node.emit(NodeEvent.ERROR_UPDATED);
	}
}
