import {BaseParamType} from '../_Base';
import {ParamEvent} from 'src/engine/poly/ParamEvent';

export class EmitController {
	_blocked_emit: boolean = false;
	_blocked_parent_emit: boolean = false;
	_count_by_event_name: Dictionary<number> = {};
	constructor(protected param: BaseParamType) {}

	get emit_allowed(): boolean {
		if (this._blocked_emit === true) {
			return false;
		}

		if (this.param.scene.loading_controller.is_loading) {
			return false;
		}
		// TODO: should I also prevent nodes from updating
		// when they are being called in a loop such as from the Copy SOP?
		//node = this.node()
		//node? && !node.is_cooking() && this.scene().emit_allowed() # this prevents a camera from updating its param for instance
		// although maybe I should send a dirty to the store, and then that store queries the param?
		return this.param.scene.events_controller.emit_allowed;
	}

	block_emit() {
		this._blocked_emit = true;
		if (this.param.is_multiple && this.param.components) {
			this.param.components.forEach((c) => c.emit_controller.block_emit());
		}
		return true;
	}
	unblock_emit() {
		this._blocked_emit = false;
		if (this.param.is_multiple && this.param.components) {
			this.param.components.forEach((c) => c.emit_controller.unblock_emit());
		}
		return true;
	}
	block_parent_emit() {
		this._blocked_parent_emit = true;
		return true;
	}
	unblock_parent_emit() {
		this._blocked_parent_emit = false;
		return true;
	}

	increment_count(event_name: ParamEvent) {
		this._count_by_event_name[event_name] = this._count_by_event_name[event_name] || 0;
		this._count_by_event_name[event_name] += 1;
	}
	events_count(event_name: ParamEvent): number {
		return this._count_by_event_name[event_name] || 0;
	}

	emit(event: ParamEvent) {
		if (this.emit_allowed) {
			this.param.emit(event);

			if (this.param.parent_param != null && this._blocked_parent_emit !== true) {
				this.param.parent_param.emit(event);
			}
		}
	}
	// emit_param_updated() {
	// 	console.log('emit_param_updated', this.param.name, this.emit_allowed);
	// 	if (this.emit_allowed) {
	// 		this.param.emit(ParamEvent.UPDATED);

	// 		if (this.param.parent_param != null && this._blocked_parent_emit !== true) {
	// 			this.param.parent_param.emit(ParamEvent.UPDATED);
	// 		}
	// 	}
	// 	//else
	// 	//	this.emit('param_updated')

	// 	// return null
	// }
}
