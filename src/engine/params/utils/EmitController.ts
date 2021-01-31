import {BaseParamType} from '../_Base';
import {ParamEvent} from '../../poly/ParamEvent';
import {PolyDictionary} from '../../../types/GlobalTypes';

export class EmitController {
	_blocked_emit: boolean = false;
	_blocked_parent_emit: boolean = false;
	_count_by_event_name: PolyDictionary<number> = {};
	constructor(protected param: BaseParamType) {}

	emitAllowed(): boolean {
		if (this._blocked_emit === true) {
			return false;
		}

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
		this._blocked_emit = true;
		if (this.param.isMultiple() && this.param.components) {
			for (let component of this.param.components) {
				component.emitController.blockEmit();
			}
		}
		return true;
	}
	unblockEmit() {
		this._blocked_emit = false;
		if (this.param.isMultiple() && this.param.components) {
			for (let component of this.param.components) {
				component.emitController.unblockEmit();
			}
		}
		return true;
	}
	blockParentEmit() {
		this._blocked_parent_emit = true;
		return true;
	}
	unblockParentEmit() {
		this._blocked_parent_emit = false;
		return true;
	}

	incrementCount(event_name: ParamEvent) {
		this._count_by_event_name[event_name] = this._count_by_event_name[event_name] || 0;
		this._count_by_event_name[event_name] += 1;
	}
	eventsCount(event_name: ParamEvent): number {
		return this._count_by_event_name[event_name] || 0;
	}

	emit(event: ParamEvent) {
		if (this.emitAllowed()) {
			this.param.emit(event);

			if (this.param.parent_param != null && this._blocked_parent_emit !== true) {
				this.param.parent_param.emit(event);
			}
		}
	}
}
