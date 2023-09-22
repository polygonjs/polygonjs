import {BaseParamType} from '../_Base';
import {ParamEvent} from '../../poly/ParamEvent';

export class EmitController {
	_blockedEmit: boolean = false;
	_blockedParentEmit: boolean = false;
	_countByEventName: Map<string, number> = new Map();
	constructor(protected param: BaseParamType) {}

	emitAllowed(): boolean {
		if (this._blockedEmit === true) {
			return false;
		}
		// be careful as this seems to prevent camera from panning as expected
		// if (this.param.scene().timeController.playing()) {
		// 	return false;
		// }

		if (this.param.scene().loadingController.isLoading()) {
			return false;
		}
		// TODO: should I also prevent nodes from updating
		// when they are being called in a loop such as from the Copy SOP?
		//node = this.node()
		//node? && !node.is_cooking() && this.scene().emit_allowed() # this prevents a camera from updating its param for instance
		// although maybe I should send a dirty to the store, and then that store queries the param?
		return this.param.scene().dispatchController.emitAllowed();
	}

	blockEmit() {
		this._blockedEmit = true;
		if (this.param.isMultiple() && this.param.components) {
			for (const component of this.param.components) {
				component.emitController.blockEmit();
			}
		}
		return true;
	}
	unblockEmit() {
		this._blockedEmit = false;
		if (this.param.isMultiple() && this.param.components) {
			for (const component of this.param.components) {
				component.emitController.unblockEmit();
			}
		}
		return true;
	}
	blockParentEmit() {
		this._blockedParentEmit = true;
		return true;
	}
	unblockParentEmit() {
		this._blockedParentEmit = false;
		return true;
	}

	incrementCount(eventName: ParamEvent) {
		const count = (this._countByEventName.get(eventName) || 0) + 1;
		this._countByEventName.set(eventName, count);
	}
	eventsCount(eventName: ParamEvent): number {
		return this._countByEventName.get(eventName) || 0;
	}

	emit(event: ParamEvent) {
		if (this.emitAllowed()) {
			this.param.emit(event);

			const parentParam = this.param.parentParam();
			if (parentParam != null && this._blockedParentEmit !== true) {
				parentParam.emit(event);
			}
		}
	}
}
