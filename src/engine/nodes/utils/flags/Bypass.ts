import {BaseFlag} from './Base';
import {NodeEvent} from '../../../poly/NodeEvent';

export class BypassFlag extends BaseFlag {
	protected _state: boolean = false;
	on_update() {
		this.node.emit(NodeEvent.FLAG_BYPASS_UPDATED);
		this.node.set_dirty();
	}
}
