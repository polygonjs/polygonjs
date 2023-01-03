import {BaseParamType} from '../../_Base';
import {ParamEvent} from '../../../poly/ParamEvent';
import {Poly} from '../../../Poly';

export class ParamErrorState {
	private _message: string | undefined;
	constructor(private param: BaseParamType) {}

	set(message: string | undefined) {
		if (this._message != message) {
			if (message) {
				Poly.error(`[${this.param.path()}] error: '${message}'`);
			} else {
				Poly.warn(`[${this.param.path()}] clear error`);
			}
			this._message = message;
			this.param.emitController.emit(ParamEvent.ERROR_UPDATED);
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
}
